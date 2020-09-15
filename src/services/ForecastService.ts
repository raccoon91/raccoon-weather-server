import { Op } from "sequelize";
import { RootService } from "./RootService";
import { CurrentWeather, Forecast, RedisGet, RedisSet } from "../models";
import {
  IWeatherData,
  IShortForecastResponseData,
  IShortForecastData,
  IMidForecastResponseData,
  ICityKor,
} from "../interface";
import { cityGeolocationList, momentKR, tomorrow, dateLog, getMidForecastDate, getShortForecastDate } from "../utils";

export class ForecastService extends RootService {
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
      tragetDate = tomorrow(currentWeather.weather_date).format("YYYY-MM-DD 00:00:00");
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

  static parseShortForecastResponseData = (data: IShortForecastResponseData[], city: ICityKor): IShortForecastData => {
    const result: IShortForecastData = {};

    data.forEach((item) => {
      const { fcstDate, fcstTime, fcstValue, category } = item;

      if (!result[`${fcstDate}:${fcstTime}`]) {
        result[`${fcstDate}:${fcstTime}`] = {
          city,
          weather_date: momentKR(`${fcstDate} ${fcstTime}`).format("YYYY-MM-DD HH:00:00"),
          hour: String(fcstTime).slice(0, 2),
        };
      }

      switch (category) {
        case "T1H":
          result[`${fcstDate}:${fcstTime}`].temp = fcstValue;
          break;
        case "SKY":
          result[`${fcstDate}:${fcstTime}`].sky = fcstValue;
          break;
        case "PTY":
          result[`${fcstDate}:${fcstTime}`].pty = fcstValue;
          break;
        case "REH":
          result[`${fcstDate}:${fcstTime}`].reh = fcstValue;
          break;
        case "RN1":
          result[`${fcstDate}:${fcstTime}`].rn1 = fcstValue;
          break;
        case "PTY":
          result[`${fcstDate}:${fcstTime}`].pty = fcstValue;
          break;
        case "LGT":
          result[`${fcstDate}:${fcstTime}`].lgt = fcstValue;
          break;
        default:
          break;
      }
    });

    return result;
  };

  static parseMidForecastResponseData = (data: IMidForecastResponseData[], city: ICityKor): IWeatherData => {
    const result: IWeatherData = {};

    data.forEach((item) => {
      const { fcstDate, fcstTime, fcstValue, category } = item;

      if (!result[`${fcstDate}:${fcstTime}`]) {
        result[`${fcstDate}:${fcstTime}`] = {
          city,
          weather_date: momentKR(`${fcstDate} ${fcstTime}`).format("YYYY-MM-DD HH:00:00"),
          hour: fcstTime.slice(0, 2),
        };
      }

      switch (category) {
        case "POP":
          result[`${fcstDate}:${fcstTime}`].pop = fcstValue;
          break;
        case "SKY":
          result[`${fcstDate}:${fcstTime}`].sky = fcstValue;
          break;
        case "PTY":
          result[`${fcstDate}:${fcstTime}`].pty = fcstValue;
          break;
        case "REH":
          result[`${fcstDate}:${fcstTime}`].reh = fcstValue;
          break;
        case "T3H":
          result[`${fcstDate}:${fcstTime}`].temp = fcstValue;
          break;
        case "TMX":
          result[`${fcstDate}:${fcstTime}`].tmx = fcstValue;
          break;
        case "TMN":
          result[`${fcstDate}:${fcstTime}`].tmn = fcstValue;
          break;
        default:
          break;
      }
    });

    return result;
  };

  static cronShortForecast = async (): Promise<void> => {
    try {
      const { currentDate, currentTime } = getShortForecastDate();

      for (let i = 0; i < cityGeolocationList.length; i++) {
        const location = cityGeolocationList[i];
        const requestParams = {
          base_date: currentDate,
          base_time: currentTime,
          nx: location.nx,
          ny: location.ny,
          numOfRows: 40,
          pageNo: 1,
        };

        const weatherData = await ForecastService.requestWeather<IShortForecastResponseData>(
          "getUltraSrtFcst",
          requestParams,
        );
        console.log("cron shortForecast", weatherData);
        const shortForecast = ForecastService.parseShortForecastResponseData(weatherData, location.city);

        const forecastDateTime = Object.keys(shortForecast);

        for (let i = 0; i < forecastDateTime.length; i++) {
          await ForecastService.updateOrCreateForecast(Forecast, shortForecast[forecastDateTime[i]]);
        }
      }

      console.log("success short forecast job");
    } catch (error) {
      console.error(`[short forecast request FAIL ${dateLog()}][${error.message}]`);
      console.error(error.stack);
    }
  };

  static cronMidForecast = async (): Promise<void> => {
    try {
      const { forecastDate, forecastTime } = getMidForecastDate();

      for (let i = 0; i < cityGeolocationList.length; i++) {
        const location = cityGeolocationList[i];
        const requestParams = {
          base_date: forecastDate,
          base_time: forecastTime,
          nx: location.nx,
          ny: location.ny,
          numOfRows: 184,
          pageNo: 1,
        };

        const weatherData = await ForecastService.requestWeather<IMidForecastResponseData>(
          "getVilageFcst",
          requestParams,
        );
        console.log("cron midForecast", weatherData);
        const midForecast = ForecastService.parseMidForecastResponseData(weatherData, location.city);

        const forecastDateTime = Object.keys(midForecast);

        for (let i = 0; i < forecastDateTime.length; i++) {
          await ForecastService.updateOrCreateForecast(Forecast, midForecast[forecastDateTime[i]]);
        }
      }

      console.log("success mid forecastDateTime job");
    } catch (error) {
      console.error(`[mid forecastDateTime request FAIL ${dateLog()}][${error.message}]`);
      console.error(error.stack);
    }
  };
}
