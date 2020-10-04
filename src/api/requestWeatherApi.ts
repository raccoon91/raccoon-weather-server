import axios, { AxiosInstance } from "axios";

const BASE_URL = "http://apis.data.go.kr/1360000/VilageFcstInfoService";

export const requestWeatherApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});
