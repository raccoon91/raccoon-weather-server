import { Op } from "sequelize";
import { RootService } from "./RootService";
import { Weather, Forecast, AirPollution } from "../models";
import { IWeatherRouteResponse, ICurrentWeatherResData, ICurrentWeatherData, ICityKor, ILocation } from "../interface";
import { cityGeolocationList, momentKR, yesterday, getCurrentWeatherDate } from "../utils";
import { errorLog, infoLog } from "../lib";

class WeatherService extends RootService {
  getCurrentWeather = async (location: ILocation): Promise<{ weather: IWeatherRouteResponse; location: ILocation }> => {
    const { city } = location;

    try {
      let weather: IWeatherRouteResponse = {};

      const currentWeather = await Weather.findOne({
        where: { city },
        order: [["weather_date", "DESC"]],
        raw: true,
      });

      if (!currentWeather) return null;

      const currentWeatherDate = currentWeather.weather_date;

      const yesterdayWeather = await Weather.findOne({
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
        where: { city },
        order: [["air_date", "ASC"]],
        raw: true,
      });

      weather = currentWeather;
      weather.yesterday_temp = yesterdayWeather ? yesterdayWeather.t1h : null;
      weather.sky = forecast ? forecast.sky : null;
      weather.pop = forecast ? forecast.pop : null;
      weather.pm10 = airPollution ? airPollution.pm10 : null;
      weather.pm25 = airPollution ? airPollution.pm25 : null;

      return { weather, location };
    } catch (error) {
      errorLog(`city - ${city} / ${error.message}`, "WeatherService - getCurrentWeather");
    }
  };

  parseResponseWeatherData = (
    data: ICurrentWeatherResData[],
    city: ICityKor,
    currentDate: string,
    currentTime: string,
    currentMinute: string,
  ): ICurrentWeatherData => {
    const result: ICurrentWeatherData = {
      city,
      weather_date: momentKR(`${currentDate} ${currentTime.slice(0, 2)}${currentMinute}`).format("YYYY-MM-DD HH:mm:00"),
    };

    data.forEach((item: ICurrentWeatherResData): void => {
      switch (item.category) {
        case "T1H":
          result.t1h = item.obsrValue;
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

  cronCurrentWeather = async (): Promise<void> => {
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

        const weatherData = await this.requestWeather<ICurrentWeatherResData>("getUltraSrtNcst", requestParams);
        const currentWeather = this.parseResponseWeatherData(
          weatherData,
          location.city,
          currentDate,
          currentTime,
          currentMinute,
        );

        await Weather.create(currentWeather);
      }

      if (currentMinute === "00") {
        infoLog("Cron", "weather", "WeatherService");
      }
    } catch (error) {
      errorLog(`weather ${error.message}`, "WeatherService - cronCurrentWeather");
      console.error(error.stack);
    }
  };
}

export default new WeatherService();
