import { Op } from "sequelize";
import { CurrentWeather, Forecast, RedisGet, RedisSet } from "../models";
import date from "../utils/date";

export class ForecastService {
  static getForecast = async (city: string, isShortForecast?: boolean): Promise<{}> => {
    const redisKey = `forecast/${isShortForecast ? "short" : "mid"}/${city}`;
    let tragetDate: string;

    const cachedShorForecast = await RedisGet(redisKey);

    if (cachedShorForecast) {
      console.log("cached", redisKey);

      return JSON.parse(cachedShorForecast);
    }

    const currentWeather = await CurrentWeather.findOne({
      where: { city },
      order: [["weather_date", "DESC"]],
      attributes: ["weather_date"],
      raw: true,
    });

    if (isShortForecast) {
      tragetDate = `${currentWeather.weather_date.slice(0, 13)}:00:00`;
    } else {
      tragetDate = date.tomorrow(currentWeather.weather_date).format("YYYY-MM-DD 00:00:00");
    }

    const forecast = await Forecast.findAll({
      where: { city, weather_date: { [Op.gte]: tragetDate } },
      order: [["weather_date", "ASC"]],
      attributes: ["temp", "sky", "pty", "reh", "pop", "hour", "weather_date"],
      limit: 8,
      raw: true,
    });

    if (!currentWeather || !(forecast || forecast.length)) return null;

    const categories = [];
    const rainProbs = [];
    const humidities = [];
    const temperatures = [];
    const conditions = [];

    forecast.forEach((item) => {
      categories.push(item.hour);
      humidities.push(item.reh);
      conditions.push([item.pty, item.sky]);
      rainProbs.push(item.pop);
      temperatures.push(item.temp);
    });

    await RedisSet(
      redisKey,
      JSON.stringify({
        categories,
        rainProbs,
        humidities,
        temperatures,
        conditions,
      }),
      "EX",
      60 * 60,
    );

    return { categories, rainProbs, humidities, temperatures, conditions };
  };

  static updateOrCreateForecast = async (forecastData, weatherDate): Promise<void> => {
    const forecast = await Forecast.findOne({
      where: {
        city: forecastData.city,
        weather_date: weatherDate,
      },
    });

    if (forecast) {
      await forecast.update(forecastData);
    } else {
      await Forecast.create(forecastData);
    }
  };
}
