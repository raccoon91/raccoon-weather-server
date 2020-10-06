import { Op } from "sequelize";
import { RootService } from "./RootService";
import { Weather, Forecast, AirPollution } from "../models";
import { IWeatherRouteResponse, ICurrentWeatherResData, ICurrentWeatherData, ICityKor, ILocation } from "../interface";
import { cityGeolocationList, momentKST, yesterday, getCurrentWeatherDate, momentFormat } from "../utils";
import { errorLog } from "../api";

class WeatherService extends RootService {
  getCurrentWeather = async (location: ILocation): Promise<{ weather: IWeatherRouteResponse; location: ILocation }> => {
    const { city } = location;

    try {
      let weather: IWeatherRouteResponse = {};
      const currentDate = momentKST();

      const currentWeather = await Weather.findOne({
        where: { city, weather_date: { [Op.lte]: currentDate.format("YYYY-MM-DD HH:mm:00") } },
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
        where: { city, weather_date: { [Op.lte]: currentWeatherDate } },
        order: [["weather_date", "DESC"]],
        attributes: ["sky", "pop", "weather_date"],
        raw: true,
      });

      const airPollution = await AirPollution.findOne({
        where: { city, air_date: { [Op.lte]: currentWeatherDate } },
        order: [["air_date", "DESC"]],
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
      throw error;
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
      weather_date: momentFormat(`${currentDate} ${currentTime.slice(0, 2)}${currentMinute}`, "YYYY-MM-DD HH:mm:00"),
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
    } catch (error) {
      errorLog(error);
    }
  };
}

export default new WeatherService();
