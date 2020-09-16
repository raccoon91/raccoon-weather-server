import { Op } from "sequelize";
import { RootService } from "./RootService";
import { CurrentWeather, ForecastWeather, RedisGet, RedisSet } from "../models";
import {
  IForecastRouteResponse,
  IShortForecastResData,
  IMidForecastResData,
  IForecastWeatherData,
  ICityKor,
} from "../interface";
import { momentKR, tomorrow, dateLog, getMidForecastDate, getShortForecastDate, cityGeolocationList } from "../utils";

class ForecastService extends RootService {
  getForecast = async (city: string, isShortForecast?: boolean): Promise<IForecastRouteResponse> => {
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

    const forecast = await ForecastWeather.findAll({
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

  parseShortForecastResponseData = (
    responseData: IShortForecastResData[],
    city: ICityKor,
  ): { [key: string]: IForecastWeatherData } => {
    const result: { [key: string]: IForecastWeatherData } = {};

    responseData.forEach((item) => {
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

  parseMidForecastResponseData = (
    responseData: IMidForecastResData[],
    city: ICityKor,
  ): { [key: string]: IForecastWeatherData } => {
    const result: { [key: string]: IForecastWeatherData } = {};

    responseData.forEach((item) => {
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

  cronShortForecast = async (): Promise<void> => {
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

        const weatherData = await this.requestWeather<IShortForecastResData>("getUltraSrtFcst", requestParams);
        const shortForecast = this.parseShortForecastResponseData(weatherData, location.city);

        const forecastDateTime = Object.keys(shortForecast);

        for (let i = 0; i < forecastDateTime.length; i++) {
          await this.updateOrCreateForecastWeather(ForecastWeather, shortForecast[forecastDateTime[i]]);
        }
      }

      console.log(`success short forecast job ${dateLog()}`);
    } catch (error) {
      console.error(`[short forecast request FAIL ${dateLog()}][${error.message}]`);
      console.error(error.stack);
    }
  };

  cronMidForecast = async (): Promise<void> => {
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

        const weatherData = await this.requestWeather<IMidForecastResData>("getVilageFcst", requestParams);
        const midForecast = this.parseMidForecastResponseData(weatherData, location.city);

        const forecastDateTime = Object.keys(midForecast);

        for (let i = 0; i < forecastDateTime.length; i++) {
          if (i === 0) {
            const { city, weather_date, pop } = midForecast[forecastDateTime[i]];
            const after1Hour = momentKR(weather_date).add(1, "hours").format("YYYY-MM-DD HH:00:00");
            const after2Hour = momentKR(weather_date).add(2, "hours").format("YYYY-MM-DD HH:00:00");

            await this.updateOrCreateForecastWeather(ForecastWeather, {
              city,
              weather_date: after1Hour,
              pop,
            });

            await this.updateOrCreateForecastWeather(ForecastWeather, {
              city,
              weather_date: after2Hour,
              pop,
            });
          }

          await this.updateOrCreateForecastWeather(ForecastWeather, midForecast[forecastDateTime[i]]);
        }
      }

      console.log(`success mid forecast job ${dateLog()}`);
    } catch (error) {
      console.error(`[mid forecast request FAIL ${dateLog()}][${error.message}]`);
      console.error(error.stack);
    }
  };
}

export default new ForecastService();
