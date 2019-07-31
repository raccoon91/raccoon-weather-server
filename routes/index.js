const express = require("express");
const moment = require("moment-timezone");
const { Weather, Airpollution } = require("../infra/mysql");
const { date } = require("../utils/utils.js");
const { Op } = require("sequelize");
const { redisGet, redisSet } = require("../infra/redis");
const geolocation = require("../middleware/geolocation.js");

const router = express.Router();

router.use(geolocation);

router.get("/weather", async (req, res) => {
  const location = req.cookies.location;
  const city = location.data.geoLocation.city;
  const key = `${city}/weather`;

  const cache = await redisGet(key);

  if (cache) {
    return res.json(JSON.parse(cache));
  }

  const weather = await Weather.findOne({
    where: { city, type: "current" },
    attributes: [
      "city",
      "temp",
      "yesterday_temp",
      "sky",
      "pty",
      "pop",
      "humidity",
      "hour",
      "weather_date"
    ]
  });

  const air = await Airpollution.findOne({
    where: { city, type: "current" },
    order: [["air_date", "DESC"]]
  });

  if (!weather || !air) res.send({ message: "data not found", weather, air });

  weather.dataValues.pm10 = air.pm10;
  weather.dataValues.pm25 = air.pm25;

  await redisSet(
    key,
    JSON.stringify({ weather, location: location.data.geoLocation })
  );

  res.json({ weather, location: location.data.geoLocation });
});

router.get("/weather/forecast", async (req, res) => {
  const city = req.cookies.location.data.geoLocation.city;
  const key = `${city}/weather/forecast`;

  const cache = await redisGet(key);

  if (cache) {
    return res.json(JSON.parse(cache));
  }

  const current = await Weather.findOne({
    where: { city, type: "current" }
  });

  const forecast = await Weather.findAll({
    where: {
      city,
      [Op.or]: [{ type: "short" }, { type: "mid" }]
    },
    order: [["weather_date", "ASC"]],
    limit: 8
  });

  if (!current || !forecast)
    return res.send({
      message: "data not found",
      weather,
      forecast
    });

  const categories = [current.dataValues.hour];
  const rainProbData = [current.dataValues.pop];
  const humidityData = [current.dataValues.humidity];
  const tempData = [current.dataValues.temp];
  const condition = [[current.dataValues.sky, current.dataValues.pty]];

  forecast.forEach(item => {
    categories.push(item.dataValues.hour);
    rainProbData.push(item.dataValues.pop);
    humidityData.push(item.dataValues.humidity);
    tempData.push(item.dataValues.temp);
    condition.push([item.dataValues.sky, item.dataValues.pty]);
  });

  await redisSet(
    key,
    JSON.stringify({
      categories,
      rainProbData,
      humidityData,
      tempData,
      condition
    })
  );

  res.json({
    categories,
    rainProbData,
    humidityData,
    tempData,
    condition
  });
});

router.get("/weather/tomorrow", async (req, res) => {
  const tomorrow = date.tomorrow(moment.tz("Asia/Seoul"));
  const city = req.cookies.location.data.geoLocation.city;
  const key = `${city}/weather/tomorrow`;

  const cache = await redisGet(key);

  if (cache) {
    return res.json(JSON.parse(cache));
  }

  const weather = await Weather.findAll({
    where: { city, weather_date: { [Op.gte]: tomorrow } },
    limit: 8
  });

  if (!weather) return res.send({ message: "data not found", weather });

  const categories = [];
  const rainProbData = [];
  const tempData = [];
  const humidityData = [];
  const condition = [];

  weather.forEach(item => {
    categories.push(item.dataValues.hour);
    rainProbData.push(item.dataValues.pop);
    humidityData.push(item.dataValues.humidity);
    tempData.push(item.dataValues.temp);
    condition.push([item.dataValues.sky, item.dataValues.pty]);
  });

  await redisSet(
    key,
    JSON.stringify({
      categories,
      rainProbData,
      humidityData,
      tempData,
      condition
    })
  );

  res.json({
    categories,
    rainProbData,
    humidityData,
    tempData,
    condition
  });
});

router.get("/location", async (req, res) => {
  const location = req.cookies.location;

  res.send(location.data);
});

module.exports = router;
