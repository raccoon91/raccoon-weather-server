import config from "../config";
import requestWeatherApi from "../lib/requestWeatherApi";
import { updateOrCreateShortForecast } from "../infra/mysql";

import { IShortForecastResponseData, IShortForecastData, ICityGeolocation } from "../interface/weather";
import { ICityKor } from "../interface/location";

import { cityGeolocationList } from "../utils/location";
import date from "../utils/date";

const { OPEN_WEATHER_API_KEY } = config;

const sliceData = (data: IShortForecastResponseData[], city: ICityKor): IShortForecastData => {
	const result: IShortForecastData = {};

	data.forEach((item) => {
		const { fcstDate, fcstTime, fcstValue, category } = item;

		if (!result[`${fcstDate}:${fcstTime}`]) {
			result[`${fcstDate}:${fcstTime}`] = {
				city,
				weather_date: date.format(`${fcstDate} ${fcstTime}`, "YYYY-MM-DD HH:00:00"),
				hour: String(fcstTime).slice(0, 2),
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
			case "RN1":
				result[`${fcstDate}:${fcstTime}`].rn1 = fcstValue;
				break;
			case "PTY":
				result[`${fcstDate}:${fcstTime}`].pty = fcstValue;
				break;
			case "LGT":
				result[`${fcstDate}:${fcstTime}`].lgt = fcstValue;
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
): Promise<IShortForecastData> => {
	const response: {
		status?: number;
		data?: { response?: { body?: { items?: { item?: IShortForecastResponseData[] } } } };
	} = await requestWeatherApi({
		method: "get",
		url: "getUltraSrtFcst",
		params: {
			serviceKey: decodeURIComponent(OPEN_WEATHER_API_KEY),
			base_date: forecastDate,
			base_time: forecastTime,
			nx: location.nx,
			ny: location.ny,
			dataType: "JSON",
			numOfRows: 40,
			pageNo: 1,
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
		const { currentDate, currentTime } = date.getShortForecastDate();

		for (let i = 0; i < cityGeolocationList.length; i++) {
			const location = cityGeolocationList[i];
			const shortForecast = await getForecast(location, currentDate, currentTime);

			const forecastTime = Object.keys(shortForecast);

			for (let i = 0; i < forecastTime.length; i++) {
				const [fcstDate, fcstTime] = forecastTime[i].split(":");

				await updateOrCreateShortForecast(
					shortForecast[forecastTime[i]],
					date.format(`${fcstDate} ${fcstTime}`, "YYYY-MM-DD HH:00:00"),
				);
			}
		}
	} catch (error) {
		console.error(`[short forecast request FAIL ${date.dateLog()}][${error.message}]`);
		console.error(error.stack);
	}
};

export default saveShortForecast;
