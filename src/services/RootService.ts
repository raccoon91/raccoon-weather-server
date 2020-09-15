import config from "../config";
import { CurrentWeather, Forecast } from "../models";
import requestWeatherApi from "../lib/requestWeatherApi";

const { OPEN_WEATHER_API_KEY } = config;

interface IRequestParams {
  base_date: string;
  base_time: string;
  nx: number;
  ny: number;
  numOfRows?: number;
  pageNo?: number;
}

export class RootService {
  static async requestWeather<T>(url: string, params: IRequestParams): Promise<T[]> {
    const response: {
      status?: number;
      data?: { response?: { body?: { items?: { item?: T[] } } } };
    } = await requestWeatherApi({
      method: "get",
      url,
      params: {
        serviceKey: decodeURIComponent(OPEN_WEATHER_API_KEY),
        dataType: "JSON",
        ...params,
      },
    });

    if (response.status !== 200) {
      throw new Error(`open api request error. item: weather status: ${response.status}`);
    }

    if (!response.data.response.body) throw new Error(`open api response empty. item: weather`);

    const data = response.data.response.body.items.item;

    return data;
  }

  static createWeather = async (weatherModel: typeof CurrentWeather, weatherData): Promise<void> => {
    const weather = await weatherModel.findOne({
      where: {
        city: weatherData.city,
        weather_date: weatherData.weather_date,
      },
    });

    if (!weather) {
      await weatherModel.create(weatherData);
    }
  };

  static updateOrCreateForecast = async (forecastModel: typeof Forecast, forecastData): Promise<void> => {
    const forecast = await forecastModel.findOne({
      where: {
        city: forecastData.city,
        weather_date: forecastData.weather_date,
      },
    });

    if (forecast) {
      await forecast.update(forecastData);
    } else {
      await forecastModel.create(forecastData);
    }
  };
}
