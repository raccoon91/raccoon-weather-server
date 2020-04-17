import express from "express";
import { WeatherModel, AirPollutionModel } from "../infra/mysql";
// import date from "../utils/date";
// import { Op } from "sequelize";
// import { IWeatherData } from "../interface/weather";
// import { IPollutionData } from "../interface/air";
import { redisGet, redisSet } from "../infra/redis";
import geolocation from "../middleware/geolocation";

const router = express.Router();

router.use(geolocation);

router.get("/weather", async (req, res) => {
	const { location } = req.body;
	const city = location.city;
	const redisKey = `${city}/weather`;
	let weather: any = {};

	const cache = await redisGet(redisKey);

	if (cache) {
		console.log("cached weather", JSON.parse(cache));
		return res.json(JSON.parse(cache));
	}

	const weatherModel = await WeatherModel.findOne({
		where: { city, type: "current" },
		attributes: ["city", "temp", "yesterday_temp", "sky", "pty", "pop", "humidity", "hour", "weather_date"],
	});

	const airModel = await AirPollutionModel.findOne({
		where: { city, type: "current" },
		order: [["air_date", "DESC"]],
	});

	if (!weatherModel || !airModel) res.send({ message: "data not found", weatherModel, airModel });

	weather = weatherModel;
	weather.pm10 = airModel.pm10;
	weather.pm25 = airModel.pm25;

	await redisSet(redisKey, JSON.stringify({ weather, location }), "EX", 60 * 1);

	res.json({ weather, location });
});

// router.get("/weather/forecast", async (req, res) => {
// 	const city = req.cookies.location.geoLocation.city;
// 	const redisKey = `${city}/weather/forecast`;

// 	const cache = await redisGet(redisKey);

// 	if (cache) {
// 		return res.json(JSON.parse(cache));
// 	}

// 	const current = await WeatherModel.findOne({
// 		where: { city, type: "current" },
// 	});

// 	const forecast = await WeatherModel.findAll({
// 		where: {
// 			city,
// 			[Op.or]: [{ type: "short" }, { type: "mid" }],
// 		},
// 		order: [["weather_date", "ASC"]],
// 		limit: 8,
// 	});

// 	if (!current || !forecast)
// 		return res.send({
// 			message: "data not found",
// 			weather,
// 			forecast,
// 		});

// 	const categories = [current.dataValues.hour];
// 	const rainProbData = [current.dataValues.pop];
// 	const humidityData = [current.dataValues.humidity];
// 	const tempData = [current.dataValues.temp];
// 	const condition = [[current.dataValues.sky, current.dataValues.pty]];

// 	forecast.forEach((item) => {
// 		categories.push(item.dataValues.hour);
// 		rainProbData.push(item.dataValues.pop);
// 		humidityData.push(item.dataValues.humidity);
// 		tempData.push(item.dataValues.temp);
// 		condition.push([item.dataValues.sky, item.dataValues.pty]);
// 	});

// 	await redisSet(
// 		redisKey,
// 		JSON.stringify({
// 			categories,
// 			rainProbData,
// 			humidityData,
// 			tempData,
// 			condition,
// 		}),
// 	);

// 	res.json({
// 		categories,
// 		rainProbData,
// 		humidityData,
// 		tempData,
// 		condition,
// 	});
// });

// router.get("/weather/tomorrow", async (req, res) => {
// 	const tomorrow = date.tomorrow(moment.tz("Asia/Seoul"));
// 	const city = req.cookies.location.geoLocation.city;
// 	const redisKey = `${city}/weather/tomorrow`;

// 	const cache = await redisGet(redisKey);

// 	if (cache) {
// 		return res.json(JSON.parse(cache));
// 	}

// 	const weather = await WeatherModel.findAll({
// 		where: { city, weather_date: { [Op.gte]: tomorrow } },
// 		limit: 8,
// 	});

// 	if (!weather) return res.send({ message: "data not found", weather });

// 	const categories = [];
// 	const rainProbData = [];
// 	const tempData = [];
// 	const humidityData = [];
// 	const condition = [];

// 	weather.forEach((item) => {
// 		categories.push(item.dataValues.hour);
// 		rainProbData.push(item.dataValues.pop);
// 		humidityData.push(item.dataValues.humidity);
// 		tempData.push(item.dataValues.temp);
// 		condition.push([item.dataValues.sky, item.dataValues.pty]);
// 	});

// 	await redisSet(
// 		redisKey,
// 		JSON.stringify({
// 			categories,
// 			rainProbData,
// 			humidityData,
// 			tempData,
// 			condition,
// 		}),
// 	);

// 	res.json({
// 		categories,
// 		rainProbData,
// 		humidityData,
// 		tempData,
// 		condition,
// 	});
// });

router.get("/location", async (req, res) => {
	const { location } = req.body;

	res.send(location);
});

export default router;