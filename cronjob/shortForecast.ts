import config from "../config";
import requestWeatherApi from "../lib/requestWeatherApi";
import { updateOrCreateShortForecast } from "../infra/mysql";

import { IShortForecastResponseData, IWeatherData, ICityGeolocation } from "../interface/weather";
import { ICityKor } from "../interface/location";

import { cityGeolocationList } from "../utils/location";
import date from "../utils/date";

const { OPEN_WEATHER_API_KEY } = config;

const sliceData = (data: IShortForecastResponseData[], city: ICityKor): IWeatherData => {
	const result: IWeatherData = {};

	data.forEach((item) => {
		const { fcstDate, fcstTime, fcstValue, category } = item;

		if (!result[`${fcstDate}:${fcstTime}`]) {
			result[`${fcstDate}:${fcstTime}`] = {
				city,
				weather_date: date.dateQuery(String(fcstDate), String(fcstTime)),
				hour: String(fcstTime).slice(0, 2),
				type: "short",
			};
		}

		switch (category) {
			case "T1H":
				result[`${fcstDate}:${fcstTime}`].temp = fcstValue;
				break;
			case "SKY":
				result[`${fcstDate}:${fcstTime}`].sky = fcstValue;
				break;
			case "PTY":
				result[`${fcstDate}:${fcstTime}`].pty = fcstValue;
				break;
			case "REH":
				result[`${fcstDate}:${fcstTime}`].humidity = fcstValue;
				break;
			default:
				break;
		}
	});

	return result;
};

const getForecast = async (
	location: ICityGeolocation,
	forecastDate: string,
	forecastTime: string,
): Promise<IWeatherData> => {
	const response: {
		status?: number;
		data?: { response?: { body?: { items?: { item?: IShortForecastResponseData[] } } } };
	} = await requestWeatherApi({
		method: "get",
		url: "ForecastTimeData",
		params: {
			ServiceKey: decodeURIComponent(OPEN_WEATHER_API_KEY),
			base_date: forecastDate,
			base_time: forecastTime,
			nx: location.nx,
			ny: location.ny,
			numOfRows: 40,
			_type: "json",
		},
	});

	if (response.status !== 200) {
		throw new Error(`open api request error. item: weather status: ${response.status}`);
	}

	if (!response.data.response.body) throw new Error(`open api response empty. item: weather`);

	const data = response.data.response.body.items.item;
	const shortForecast = sliceData(data, location.city);

	return shortForecast;
};

const saveShortForecast = async (): Promise<void> => {
	try {
		const { currentDate, currentTime } = date.getWeatherDate();

		for (let i = 0; i < cityGeolocationList.length; i++) {
			const location = cityGeolocationList[i];
			const shortForecast = await getForecast(location, currentDate, currentTime);

			const forecastTime = Object.keys(shortForecast);

			for (let i = 0; i < forecastTime.length; i++) {
				const [fcstDate, fcstTime] = forecastTime[i].split(":");

				await updateOrCreateShortForecast(shortForecast[forecastTime[i]], date.dateQuery(fcstDate, fcstTime));
			}
		}
	} catch (error) {
		console.error(`[short forecast request FAIL ${date.today()}][${error.message}]`);
		console.error(error.stack);
	}
};

export default saveShortForecast;
