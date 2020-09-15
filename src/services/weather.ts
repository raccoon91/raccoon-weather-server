import { Op } from "sequelize";
import { CurrentWeather, Forecast, AirPollution, RedisGet, RedisSet } from "../models";
import { IWeatherRouteResponse, ILocation } from "../interface";
import date from "../utils/date";

export class WeatherService {
  static getCurrentWeather = async (
    location: ILocation,
  ): Promise<{ weather: IWeatherRouteResponse; location: ILocation }> => {
    const { city } = location;
    const redisKey = `weather/${city}`;
    let weather: IWeatherRouteResponse = {};

    const cachedWeather = await RedisGet(redisKey);

    if (cachedWeather) {
      console.log("cached weather", city);
      weather = JSON.parse(cachedWeather);

      return { weather, location };
    }

    const currentWeather = await CurrentWeather.findOne({
      where: { city },
      order: [["weather_date", "DESC"]],
      raw: true,
    });

    const currentWeatherDate = currentWeather.weather_date;

    const yesterdayWeather = await CurrentWeather.findOne({
      where: { city, weather_date: date.format(date.yesterday(currentWeatherDate), "YYYY-MM-DD HH:mm:00") },
      raw: true,
    });

    const forecast = await Forecast.findOne({
      where: { city, weather_date: { [Op.lte]: currentWeather.weather_date } },
      order: [["weather_date", "DESC"]],
      attributes: ["sky", "pop", "weather_date"],
      raw: true,
    });

    const airPollution = await AirPollution.findOne({
      where: { city, type: "current" },
      order: [["air_date", "DESC"]],
      raw: true,
    });

    if (!currentWeather || !airPollution) return null;

    weather = currentWeather;
    weather.yesterday_temp = yesterdayWeather ? yesterdayWeather.t1h : null;
    weather.sky = forecast ? forecast.sky : null;
    weather.pop = forecast ? forecast.pop : null;
    weather.pm10 = airPollution.pm10;
    weather.pm25 = airPollution.pm25;

    await RedisSet(redisKey, JSON.stringify(weather), "EX", 60 * 10);

    return { weather, location };
  };

  static createCurrentWeather = async (currentWeather): Promise<void> => {
    const weather = await CurrentWeather.findOne({
      where: {
        city: currentWeather.city,
        weather_date: currentWeather.weather_date,
      },
    });

    if (!weather) {
      await CurrentWeather.create(currentWeather);
    }
  };
}
