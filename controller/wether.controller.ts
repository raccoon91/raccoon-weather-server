import { WeatherModel, AirPollutionModel } from "../infra/mysql";
import { redisGet, redisSet } from "../infra/redis";

const weatherController = async (location) => {
	const city = location.city;
	const redisKey = `weather/${city}`;
	let weather: any = {};

	const cache = await redisGet(redisKey);

	if (cache) {
		console.log("cached weather", JSON.parse(cache));
		return JSON.parse(cache);
	}

	const weatherModel = await WeatherModel.findOne({
		where: { city },
		order: [["weather_date", "DESC"]],
		attributes: ["city", "temp", "yesterday_temp", "sky", "pty", "pop", "rn1", "humidity", "hour", "weather_date"],
	});

	const airModel = await AirPollutionModel.findOne({
		where: { city, type: "current" },
		order: [["air_date", "DESC"]],
	});

	if (!weatherModel || !airModel) return null;

	weather = weatherModel;
	weather.pm10 = airModel.pm10;
	weather.pm25 = airModel.pm25;

	await redisSet(redisKey, JSON.stringify({ weather, location }), "EX", 60 * 5);

	return { weather, location };
};

export default weatherController;
