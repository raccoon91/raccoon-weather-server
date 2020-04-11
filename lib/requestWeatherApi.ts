import axios, { AxiosInstance } from "axios";

const BASE_URL = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2";

const requestWeatherApi: AxiosInstance = axios.create({
	baseURL: BASE_URL,
});

export default requestWeatherApi;
