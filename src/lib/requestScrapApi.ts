import axios, { AxiosInstance } from "axios";

const BASE_URL = "https://www.weather.go.kr/weather/climate/past_table.jsp";

export const requestScrapApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});
