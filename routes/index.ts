import express from "express";
import geolocation from "../middleware/geolocation";
import { weatherController, forecastController, tomorrowController } from "../controller";

const router = express.Router();

router.use(geolocation);

router.get("/weather", async (req, res) => {
	const { location } = req.body;

	const weatherData = await weatherController(location);

	if (!weatherData) {
		res.send({ message: "data not found" });
	}

	res.json(weatherData);
});

router.get("/forecast", async (req, res) => {
	const { location } = req.body;

	const forecastData = await forecastController(location);

	if (!forecastData) {
		res.send({ message: "data not found" });
	}

	res.json(forecastData);
});

router.get("/tomorrow", async (req, res) => {
	const { location } = req.body;

	const tomorrowData = await tomorrowController(location);

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
