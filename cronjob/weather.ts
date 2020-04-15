import config from "../config";
import requestWeatherApi from "../lib/requestWeatherApi";
import { updateOrCreateCurrentWeather, changePastWeatherType } from "../infra/mysql";

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
): IWeatherData => {
	const result: IWeatherData = {
		city,
		weather_date: date.dateQuery(currentDate, currentTime),
		hour: currentTime.slice(0, 2),
		type: "current",
	};

	data.forEach((item: IWeatherResponseData): void => {
		switch (item.category) {
			case "T1H":
				result.temp = item.obsrValue;
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
): Promise<IWeatherData> => {
	const response: {
		status?: number;
		data?: { response?: { body?: { items?: { item?: IWeatherResponseData[] } } } };
	} = await requestWeatherApi({
		method: "get",
		url: "ForecastGrib",
		params: {
			ServiceKey: decodeURIComponent(OPEN_WEATHER_API_KEY),
			base_date: currentDate,
			base_time: currentTime,
			nx: location.nx,
			ny: location.ny,
			_type: "json",
		},
	});

	if (response.status !== 200) {
		throw new Error(`open api request error. item: weather status: ${response.status}`);
	}

	if (!response.data.response.body) throw new Error(`open api response empty. item: weather`);

	const data = response.data.response.body.items.item;
	const currentWeather = sliceData(data, location.city, currentDate, currentTime);

	return currentWeather;
};

const getCurrentWeather = async (): Promise<void> => {
	try {
		const { currentDate, currentTime, yesterday } = date.getWeatherDate();
		let weatherDate: string;

		for (let i = 0; i < cityGeolocationList.length; i++) {
			const location = cityGeolocationList[i];
			const currentWeather = await requestCurrentWeather(location, currentDate, currentTime);

			await updateOrCreateCurrentWeather(currentWeather, yesterday, currentTime);

			if (i === 0) {
				weatherDate = currentWeather.weather_date;
			}
		}

		await changePastWeatherType(weatherDate);
	} catch (error) {
		console.error(`[weather request FAIL ${date.today()}][${error.message}]`);
		console.error(error.stack);
	}
};

export default getCurrentWeather;
