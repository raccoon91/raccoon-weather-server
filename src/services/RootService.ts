import { AxiosResponse } from "axios";
import { requestWeatherApi, requestAirPollutionApi } from "../api";

const { OPEN_WEATHER_API_KEY } = process.env;

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
    try {
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
        throw new Error(`weather open api request error. url: ${url}, status: ${response.status}`);
      }

      if (!response.data.response) throw new Error(`weather open api response empty. url: ${url}`);

      const data = response.data.response.body.items.item;

      return data;
    } catch (error) {
      throw error;
    }
  }

  async requestAirPollution<T>(url: string, params: IAirpollutionRequestParams): Promise<T[]> {
    try {
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
        throw new Error(` airpollution open api request error. url: ${url}, status: ${response.status}`);
      }

      if (!response.data.list) throw new Error(`airpollution open api response empty. url: ${url}`);

      return response.data.list;
    } catch (error) {
      throw error;
    }
  }
}
