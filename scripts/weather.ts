import config from "../config";
import requestWeatherApi from "../lib/requestWeatherApi";

// const { Weather } = require("../../infra/mysql");
// const { Op } = require("sequelize");

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

const requestCurrentWeather = async (location: ICityGeolocation, currentDate: string, currentTime: string) => {
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

// const fillEmptyAttribute = async (response, yesterday, currentTime) => {
// 	let weather = await Weather.findOne({
// 		where: {
// 			city: response.city,
// 			type: "short",
// 		},
// 		order: [["weather_date", "ASC"]],
// 		attributes: ["sky", "pty", "pop"],
// 	});

// 	if (!weather) {
// 		weather = await Weather.findOne({
// 			where: {
// 				city: response.city,
// 				type: "mid",
// 			},
// 			order: [["weather_date", "ASC"]],
// 			attributes: ["sky", "pty", "pop"],
// 		});
// 	}

// 	const yesterdayWeather = await Weather.findOne({
// 		where: {
// 			city: response.city,
// 			weather_date: date.dateQuery(yesterday, currentTime),
// 		},
// 	});

// 	if (weather) {
// 		const weatherData = weather.dataValues;

// 		response.sky = weatherData.sky;
// 		response.pty = weatherData.pty;
// 		response.pop = weatherData.pop;
// 	}

// 	if (yesterdayWeather) {
// 		const yesterdayData = yesterdayWeather.dataValues;

// 		response.yesterday_temp = yesterdayData.temp;

// 		await yesterdayWeather.update({ type: "delete" });
// 	}

// 	return response;
// };

// const bulkUpdateOrCreate = async (weather, response, yesterday, currentTime) => {
// 	fillEmptyAttribute(response, yesterday, currentTime);
// 	if (weather) {
// 		let result = response;

// 		if (!weather.dataValues.yesterday_temp) {
// 			result = await fillEmptyAttribute(response, yesterday, currentTime);
// 		}

// 		weather.update(result);
// 	} else {
// 		const result = await fillEmptyAttribute(response, yesterday, currentTime);

// 		Weather.create(result);
// 	}
// };

// const changePastWeatherType = async (pastWeather) => {
// 	for (let i = 0; i < pastWeather.length; i++) {
// 		if (pastWeather[i] && pastWeather[i].dataValues.type !== "delete") {
// 			pastWeather[i].update({ type: "past" });
// 		}
// 	}
// };

const getCurrentWeather = async () => {
	try {
		const { currentDate, currentTime, yesterday } = date.getWeatherDate();

		for (let i = 0; i < cityGeolocationList.length; i++) {
			const location = cityGeolocationList[i];
			await requestCurrentWeather(location, currentDate, currentTime);
		}

		// for (let i = 0; i < response.length; i++) {
		// 	const weather = await Weather.findOne({
		// 		where: {
		// 			city: response[i].city,
		// 			weather_date: response[i].weather_date,
		// 		},
		// 	});

		// 	const pastWeather = await Weather.findAll({
		// 		where: {
		// 			weather_date: {
		// 				[Op.lt]: response[i].weather_date,
		// 			},
		// 		},
		// 	});

		// 	await bulkUpdateOrCreate(weather, response[i], yesterday, currentTime);
		// 	await changePastWeatherType(pastWeather);
		// }
	} catch (error) {
		console.error(`[weather request FAIL ${date.today()}][${error.message}]`);
		console.error(error.stack);
	}
};

export default getCurrentWeather;
