import express from "express";
import geolocation from "../middleware/geolocation";
import { redisGet } from "../infra/redis";
import { weatherController, forecastController, tomorrowController } from "../controller";

const router = express.Router();

router.use(geolocation);

router.get("/weather", async (req, res) => {
	const { location } = req.body;
	const { city } = location;
	const redisKey = `weather/${city}`;

	const cache = await redisGet(redisKey);

	if (cache) {
		console.log("cached weather", city);
		return res.json(JSON.parse(cache));
	}

	const weatherData = await weatherController(location);

	if (!weatherData) {
		res.send({ message: "data not found" });
	}

	res.json(weatherData);
});

router.get("/forecast", async (req, res) => {
	const { city } = req.body.location;
	const redisKey = `forecast/${city}`;

	const cache = await redisGet(redisKey);

	if (cache) {
		console.log("cached forecast", city);
		return res.json(JSON.parse(cache));
	}

	const forecastData = await forecastController(city);

	if (!forecastData) {
		res.send({ message: "data not found" });
	}

	res.json(forecastData);
});

router.get("/tomorrow", async (req, res) => {
	const { city } = req.body.location;
	const redisKey = `tomorrow/${city}`;

	const cache = await redisGet(redisKey);

	if (cache) {
		console.log("cached tomorrow", city);
		return res.json(JSON.parse(cache));
	}

	const tomorrowData = await tomorrowController(city);

	if (!tomorrowData) {
		res.send({ message: "data not found" });
	}

	res.json(tomorrowData);
});

router.get("/location", async (req, res) => {
	const { location } = req.body;

	res.send(location);
});

export default router;
