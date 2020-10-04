import axios, { AxiosInstance } from "axios";

const BASE_URL = "http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc";

export const requestAirPollutionApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});
