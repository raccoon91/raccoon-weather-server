import config from "../../config";
import requestWeatherApi from "../../lib/requestWeatherApi";

// const { Weather } = require("../../infra/mysql");

import { IShortForecastResponseData, IShortForecastData, ICityGeolocation } from "../../interface/weather";
import { ICityKor } from "../../interface/location";

import { cityGeolocationList } from "../../utils/location";
import date from "../../utils/date";

const { OPEN_WEATHER_API_KEY } = config;

const sliceData = (data: IShortForecastResponseData[], city: ICityKor): IShortForecastData => {
	let result: IShortForecastData = {};

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

const getForecast = async (location: ICityGeolocation, forecastDate: string, forecastTime: string) => {
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

// const fillEmptyAttribute = async (response, weatherDate) => {
// 	const weather = await Weather.findOne({
// 		where: {
// 			city: response.city,
// 			type: "shor",
// 		},
// 		order: [["weather_date", "ASC"]],
// 		attributes: ["pop"],
// 	});

// 	const yesterdayWeather = await Weather.findOne({
// 		where: {
// 			city: response.city,
// 			weather_date: date.yesterday(moment(weatherDate)),
// 		},
// 	});

// 	if (weather) {
// 		const weatherData = weather.dataValues;

// 		response.pop = weatherData.pop;
// 	}

// 	if (yesterdayWeather) {
// 		const yesterdayData = yesterdayWeather.dataValues;

// 		response.yesterday_temp = yesterdayData.temp;
// 	}

// 	return response;
// };

// const bulkUpdateOrCreate = async (weather, response, weatherDate) => {
// 	if (weather) {
// 		let result = response;

// 		if (!weather.dataValues.yesterday_temp) {
// 			result = await fillEmptyAttribute(response, weatherDate);
// 		}

// 		weather.update(result);
// 	} else {
// 		const result = await fillEmptyAttribute(response, weatherDate);

// 		Weather.create(result);
// 	}
// };

const saveShortForecast = async () => {
	try {
		const { currentDate, currentTime } = date.getWeatherDate();

		for (let i = 0; i < cityGeolocationList.length; i++) {
			const location = cityGeolocationList[i];
			await getForecast(location, currentDate, currentTime);
		}

		// for (let i = 0; i < response.length; i++) {
		// 	const forecastTime = Object.keys(response[i]);

		// 	for (let j = 0; j < forecastTime.length; j++) {
		// 		const fcstDate = forecastTime[j].split(":")[0];
		// 		const fcstTime = forecastTime[j].split(":")[1];

		// 		const weather = await Weather.findOne({
		// 			where: {
		// 				city: response[i][forecastTime[j]].city,
		// 				weather_date: date.dateQuery(fcstDate, fcstTime),
		// 			},
		// 		});

		// 		await bulkUpdateOrCreate(weather, response[i][forecastTime[j]], date.dateQuery(fcstDate, fcstTime));
		// 	}
		// }
	} catch (error) {
		console.error(`[short forecast request FAIL ${date.today()}][${error.message}]`);
		console.error(error.stack);
	}
};

export default saveShortForecast;
