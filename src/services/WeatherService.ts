import { Op } from "sequelize";
import { RootService } from "./RootService";
import { CurrentWeather, Forecast, AirPollution, RedisGet, RedisSet } from "../models";
import { IWeatherRouteResponse, IWeatherResponseData, IWeatherData, ICityKor, ILocation } from "../interface";
import { cityGeolocationList, momentKR, yesterday, getCurrentWeatherDate, dateLog } from "../utils";

export class WeatherService extends RootService {
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
      where: { city, weather_date: yesterday(currentWeatherDate).format("YYYY-MM-DD HH:mm:00") },
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

  static parseResponseWeatherData = (
    data: IWeatherResponseData[],
    city: ICityKor,
    currentDate: string,
    currentTime: string,
    currentMinute: string,
  ): IWeatherData => {
    const result: IWeatherData = {
      city,
      weather_date: momentKR(`${currentDate} ${currentTime.slice(0, 2)}${currentMinute}`).format("YYYY-MM-DD HH:mm:00"),
    };

    data.forEach((item: IWeatherResponseData): void => {
      switch (item.category) {
        case "T1H":
          result.temp = item.obsrValue;
          break;
        case "PTY":
          result.pty = item.obsrValue;
          break;
        case "RN1":
          result.rn1 = item.obsrValue;
          break;
        case "REH":
          result.reh = item.obsrValue;
          break;
        default:
          break;
      }
    });

    return result;
  };

  static cronCurrentWeather = async (): Promise<void> => {
    try {
      const { currentDate, currentTime, currentMinute } = getCurrentWeatherDate();

      for (let i = 0; i < cityGeolocationList.length; i++) {
        const location = cityGeolocationList[i];
        const requestParams = {
          base_date: currentDate,
          base_time: currentTime,
          nx: location.nx,
          ny: location.ny,
        };

        const weatherData = await WeatherService.requestWeather<IWeatherResponseData>("getUltraSrtNcst", requestParams);
        console.log("cron weather", weatherData);
        const currentWeather = WeatherService.parseResponseWeatherData(
          weatherData,
          location.city,
          currentDate,
          currentTime,
          currentMinute,
        );

        await WeatherService.createWeather(CurrentWeather, currentWeather);
      }

      console.log("success weather job");
    } catch (error) {
      console.error(`[weather request FAIL ${dateLog()}][${error.message}]`);
      console.error(error.stack);
    }
  };
}
