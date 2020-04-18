import config from "../config";
import requestWeatherApi from "../lib/requestWeatherApi";
import { updateOrCreateCurrentWeather } from "../infra/mysql";

import { IWeatherResponseData, ICityGeolocation, IWeatherData } from "../interface/weather";
import { ICityKor } from "../interface/location";

import { cityGeolocationList } from "../utils/location";
import date from "../utils/date";

const { OPEN_WEATHER_API_KEY } = config;

const sliceData = (
	data: IWeatherResponseData[],
	city: ICityKor,
	currentDate: string,
	currentTime: string,
	currentMinute: string,
): IWeatherData => {
	const result: IWeatherData = {
		city,
		weather_date: date.format(`${currentDate} ${currentTime.slice(0, 2)}${currentMinute}`, "YYYY-MM-DD HH:mm:00"),
		hour: currentTime.slice(0, 2),
	};

	data.forEach((item: IWeatherResponseData): void => {
		switch (item.category) {
			case "T1H":
				result.temp = item.obsrValue;
				break;
			case "PTY":
				result.pty = item.obsrValue;
				break;
			case "RN1":
				result.rn1 = item.obsrValue;
				break;
			case "REH":
				result.humidity = item.obsrValue;
				break;
			default:
				break;
		}
	});

	return result;
};

const requestCurrentWeather = async (
	location: ICityGeolocation,
	currentDate: string,
	currentTime: string,
	currentMinute: string,
): Promise<IWeatherData> => {
	const response: {
		status?: number;
		data?: { response?: { body?: { items?: { item?: IWeatherResponseData[] } } } };
	} = await requestWeatherApi({
		method: "get",
		url: "getUltraSrtNcst",
		params: {
			serviceKey: decodeURIComponent(OPEN_WEATHER_API_KEY),
			base_date: currentDate,
			base_time: currentTime,
			nx: location.nx,
			ny: location.ny,
			dataType: "JSON",
		},
	});

	if (response.status !== 200) {
		throw new Error(`open api request error. item: weather status: ${response.status}`);
	}

	if (!response.data.response.body) throw new Error(`open api response empty. item: weather`);

	const data = response.data.response.body.items.item;
	const currentWeather = sliceData(data, location.city, currentDate, currentTime, currentMinute);

	return currentWeather;
};

const getCurrentWeather = async (): Promise<void> => {
	try {
		const { currentDate, currentTime, currentMinute } = date.getCurrentWeatherDate();

		for (let i = 0; i < cityGeolocationList.length; i++) {
			const location = cityGeolocationList[i];
			const currentWeather = await requestCurrentWeather(location, currentDate, currentTime, currentMinute);

			await updateOrCreateCurrentWeather(currentWeather, currentDate, currentTime, currentMinute);
		}
	} catch (error) {
		console.error(`[weather request FAIL ${date.dateLog()}][${error.message}]`);
		console.error(error.stack);
	}
};

export default getCurrentWeather;
