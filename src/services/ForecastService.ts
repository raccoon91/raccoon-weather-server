import { Op } from "sequelize";
import { RootService } from "./RootService";
import { Weather, Forecast } from "../models";
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
    let tragetDate: string;

    const currentWeather = await Weather.findOne({
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

    return { categories, rainProbs, humidities, temperatures, conditions };
  };

  parseShortForecastResponseData = (
    responseData: IShortForecastResData[],
    city: ICityKor,
  ): { [key: string]: IForecastWeatherData } => {
    const result: { [key: string]: IForecastWeatherData } = {};

    responseData.forEach((item) => {
      const { fcstDate, fcstTime, fcstValue, category } = item;
      const weather_date = momentKR(`${fcstDate} ${fcstTime}`).format("YYYY-MM-DD HH:00:00");

      if (!result[weather_date]) {
        result[weather_date] = {
          city,
          weather_date,
          hour: String(fcstTime).slice(0, 2),
        };
      }

      switch (category) {
        case "T1H":
          result[weather_date].temp = fcstValue;
          break;
        case "SKY":
          result[weather_date].sky = fcstValue;
          break;
        case "PTY":
          result[weather_date].pty = fcstValue;
          break;
        case "REH":
          result[weather_date].reh = fcstValue;
          break;
        case "PTY":
          result[weather_date].pty = fcstValue;
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
      const weather_date = momentKR(`${fcstDate} ${fcstTime}`).format("YYYY-MM-DD HH:00:00");

      if (!result[weather_date]) {
        result[weather_date] = {
          city,
          weather_date,
          hour: fcstTime.slice(0, 2),
        };
      }

      switch (category) {
        case "POP":
          result[weather_date].pop = fcstValue;
          break;
        case "SKY":
          result[weather_date].sky = fcstValue;
          break;
        case "PTY":
          result[weather_date].pty = fcstValue;
          break;
        case "REH":
          result[weather_date].reh = fcstValue;
          break;
        case "T3H":
          result[weather_date].temp = fcstValue;
          break;
        case "TMX":
          result[weather_date].tmx = fcstValue;
          break;
        case "TMN":
          result[weather_date].tmn = fcstValue;
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

        let midForecast: IForecastWeatherData;

        for (let i = 0; i < forecastDateTime.length; i++) {
          const hour = momentKR(forecastDateTime[i]).hour();
          const forecastData = shortForecast[forecastDateTime[i]];

          const forecastWeather = await Forecast.findOne({
            where: {
              city: forecastData.city,
              weather_date: forecastData.weather_date,
            },
          });

          if (hour % 3 === 0) {
            midForecast = await Forecast.findOne({
              where: {
                city: forecastData.city,
                weather_date: forecastData.weather_date,
              },
            });
          }

          if (midForecast) {
            forecastData.pop = midForecast.pop;
          }

          if (forecastWeather) {
            await forecastWeather.update(forecastData);
          } else {
            await Forecast.create(forecastData);
          }
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
          const forecastData = midForecast[forecastDateTime[i]];

          const forecastWeather = await Forecast.findOne({
            where: {
              city: forecastData.city,
              weather_date: forecastData.weather_date,
            },
          });

          if (forecastWeather) {
            await forecastWeather.update(forecastData);
          } else {
            await Forecast.create(forecastData);
          }
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
