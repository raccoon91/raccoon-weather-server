import { WeatherModel, AirPollutionModel } from "../infra/mysql";
import { redisSet } from "../infra/redis";

import { IWeatherRouteResponse, ILocation } from "../interface";

const weatherController = async (
  location: ILocation,
): Promise<{ weather: IWeatherRouteResponse; location: ILocation }> => {
  const { city } = location;
  const redisKey = `weather/${city}`;
  let weather: IWeatherRouteResponse = {};

  const weatherModel = await WeatherModel.findOne({
    where: { city },
    order: [["weather_date", "DESC"]],
    attributes: ["city", "temp", "yesterday_temp", "sky", "pty", "pop", "rn1", "humidity", "hour", "weather_date"],
    raw: true,
  });

  const airPollution = await AirPollutionModel.findOne({
    where: { city, type: "current" },
    order: [["air_date", "DESC"]],
    raw: true,
  });

  if (!weatherModel || !airPollution) return null;

  weather = weatherModel;
  weather.pm10 = airPollution.pm10;
  weather.pm25 = airPollution.pm25;

  await redisSet(redisKey, JSON.stringify({ weather, location }), "EX", 60 * 10);

  return { weather, location };
};

export default weatherController;
