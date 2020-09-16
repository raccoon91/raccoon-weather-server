import { AxiosResponse } from "axios";
import config from "../config";
import { CurrentWeather, ForecastWeather, AirPollution } from "../models";
import { IForecastWeatherData, IAirPollutionData, IAirForecastData } from "../interface";
import { requestWeatherApi, requestAirPollutionApi } from "../lib";

const { OPEN_WEATHER_API_KEY } = config;

interface IWeatherRequestParams {
  base_date: string;
  base_time: string;
  nx: number;
  ny: number;
  numOfRows?: number;
  pageNo?: number;
}

interface IAirpollutionRequestParams {
  itemCode?: string;
  informCode?: string;
  dataGubun?: string;
  searchDate?: string;
}

export class RootService {
  async requestWeather<T>(url: string, params: IWeatherRequestParams): Promise<T[]> {
    const response: AxiosResponse<{ response?: { body?: { items?: { item?: T[] } } } }> = await requestWeatherApi({
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

  async requestAirPollution<T>(url: string, params: IAirpollutionRequestParams): Promise<T[]> {
    const response: AxiosResponse<{ list?: T[] }> = await requestAirPollutionApi({
      method: "get",
      url,
      params: {
        ServiceKey: decodeURIComponent(OPEN_WEATHER_API_KEY),
        _returnType: "json",
        ...params,
      },
    });

    if (response.status !== 200) {
      throw new Error(`open api request error. item: airpollution status: ${response.status}`);
    }

    if (!response.data.list) throw new Error(`open api response empty. item: airpollution`);

    return response.data.list;
  }

  createCurrentWeather = async (weatherModel: typeof CurrentWeather, weatherData): Promise<void> => {
    const currentWeather = await weatherModel.findOne({
      where: {
        city: weatherData.city,
        weather_date: weatherData.weather_date,
      },
    });

    if (!currentWeather) {
      await weatherModel.create(weatherData);
    }
  };

  updateOrCreateForecastWeather = async (
    forecastModel: typeof ForecastWeather,
    forecastData: IForecastWeatherData,
  ): Promise<void> => {
    const forecastWeather = await forecastModel.findOne({
      where: {
        city: forecastData.city,
        weather_date: forecastData.weather_date,
      },
    });

    if (forecastWeather) {
      await forecastWeather.update(Object.assign(forecastWeather, forecastData));
    } else if (forecastData.hour) {
      await forecastModel.create(forecastData);
    }
  };

  bulkUpdateOrCreateAirPollution = async (
    airpollutionModel: typeof AirPollution,
    airpollutionDataList: (IAirPollutionData | IAirForecastData)[],
  ): Promise<void> => {
    for (let i = 0; i < airpollutionDataList.length; i++) {
      const airPollutionData = airpollutionDataList[i];

      const airpollution = await airpollutionModel.findOne({
        where: {
          city: airPollutionData.city,
          air_date: airPollutionData.air_date,
        },
      });

      if (airpollution) {
        await airpollution.update(airPollutionData);
      } else {
        await airpollutionModel.create(airPollutionData);
      }
    }
  };
}
