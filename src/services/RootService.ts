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
}
