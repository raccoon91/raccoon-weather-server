import { Op } from "sequelize";

import { ShortForecast, MidForecast } from "../infra/mysql";
import { redisSet } from "../infra/redis";
import { IForecastRouteResponse } from "../interface";

import date from "../utils/date";

const tomorrowController = async (city: string): Promise<IForecastRouteResponse> => {
	const redisKey = `tomorrow/${city}`;
	let forecastCount = 8;

	let tomorrowDate = date.format(date.tomorrow(date.today()), "YYYY-MM-DD HH:00:00");

	const shortForecast = await ShortForecast.findAll({
		where: { city, weather_date: { [Op.gte]: tomorrowDate } },
		attributes: ["temp", "sky", "pty", "humidity", "hour", "weather_date"],
		limit: 8,
		raw: true,
	});

	if (shortForecast && shortForecast.length) {
		forecastCount -= shortForecast.length;
		tomorrowDate = shortForecast[shortForecast.length - 1].weather_date;
	}

	const midForecast = await MidForecast.findAll({
		where: { city, weather_date: { [Op.gt]: tomorrowDate } },
		attributes: ["t3h", "sky", "pty", "pop", "humidity", "hour", "weather_date"],
		limit: forecastCount,
		raw: true,
	});

	if (!(shortForecast || shortForecast.length) || !(midForecast || midForecast.length)) return null;

	const categories = [];
	const rainProbData = [];
	const tempData = [];
	const humidityData = [];
	const condition = [];

	shortForecast.forEach((item) => {
		categories.push(item.hour);
		rainProbData.push(midForecast[0].pop);
		humidityData.push(item.humidity);
		tempData.push(item.temp);
		condition.push([item.sky, item.pty]);
	});

	midForecast.forEach((item) => {
		categories.push(item.hour);
		rainProbData.push(item.pop);
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
		60 * 60 * 3,
	);

	return {
		categories,
		rainProbData,
		humidityData,
		tempData,
		condition,
	};
};

export default tomorrowController;
