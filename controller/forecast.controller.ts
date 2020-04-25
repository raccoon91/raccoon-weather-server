import { Op } from "sequelize";

import { WeatherModel, ShortForecast, MidForecast } from "../infra/mysql";
import { redisSet } from "../infra/redis";
import { IForecastRouteResponse } from "../interface";

const forecastController = async (city: string): Promise<IForecastRouteResponse> => {
	const redisKey = `forecast/${city}`;
	let weatherCount = 7;

	const currentWeather = await WeatherModel.findOne({
		where: { city },
		order: [["weather_date", "DESC"]],
		attributes: ["temp", "sky", "pty", "pop", "humidity", "hour", "weather_date"],
		raw: true,
	});

	const shortForecast = await ShortForecast.findAll({
		where: { city, weather_date: { [Op.gt]: currentWeather.weather_date } },
		attributes: ["temp", "sky", "pty", "humidity", "hour", "weather_date"],
		limit: 8,
		raw: true,
	});

	weatherCount -= shortForecast.length;

	const midForecast = await MidForecast.findAll({
		where: { city, weather_date: { [Op.gt]: shortForecast[shortForecast.length - 1].weather_date } },
		attributes: ["t3h", "sky", "pty", "pop", "humidity", "hour", "weather_date"],
		limit: weatherCount,
		raw: true,
	});

	if (!currentWeather || !(shortForecast || shortForecast.length) || !(midForecast || midForecast.length)) return null;

	const categories = [currentWeather.hour];
	const rainProbData = [currentWeather.pop];
	const humidityData = [currentWeather.humidity];
	const tempData = [currentWeather.temp];
	const condition = [[currentWeather.sky, currentWeather.pty]];

	shortForecast.forEach((item) => {
		categories.push(item.hour);
		rainProbData.push(currentWeather.pop);
		humidityData.push(item.humidity);
		tempData.push(item.temp);
		condition.push([item.sky, item.pty]);
	});

	midForecast.forEach((item) => {
		categories.push(item.hour);
		rainProbData.push(currentWeather.pop);
		humidityData.push(item.humidity);
		tempData.push(item.t3h);
		condition.push([item.sky, item.pty]);
	});

	await redisSet(
		redisKey,
		JSON.stringify({
			categories,
			rainProbData,
			humidityData,
			tempData,
			condition,
		}),
		"EX",
		60 * 60,
	);

	return {
		categories,
		rainProbData,
		humidityData,
		tempData,
		condition,
	};
};

export default forecastController;
