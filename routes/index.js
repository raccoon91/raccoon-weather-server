const express = require("express");
const { Region, Weather, Airpollution } = require("../infra/mysql");
const { Op } = require("sequelize");

const router = express.Router();

router.get("/", (req, res) => {
  Region.findAll({ include: [Weather, Airpollution], where: { city: "서울" } })
    .then(result => {
      res.json(result);
    })
    .catch(console.warn);
});

router.get("/weather", async (req, res) => {
  const weather = await Weather.findOne({
    where: { city: "서울", type: "current" },
    order: [["weather_date", "DESC"]],
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
    where: { city: "서울", type: "current" },
    order: [["air_date", "DESC"]]
  });

  weather.dataValues.pm10 = air.pm10;
  weather.dataValues.pm25 = air.pm25;

  res.json(weather);
});

router.get("/weather/forecast", async (req, res) => {
  const current = await Weather.findOne({
    where: { city: "서울", type: "current" }
  });

  const shorForecast = await Weather.findAll({
    where: {
      city: "서울",
      type: "short"
    },
    order: [["weather_date", "ASC"]]
  });

  const midForecast = await Weather.findAll({
    where: {
      city: "서울",
      type: "mid"
    },
    order: [["weather_date", "ASC"]],
    limit: 7 - shorForecast.length
  });

  const categories = [current.dataValues.hour];
  const rainProbData = [current.dataValues.pop];
  const humidityData = [current.dataValues.humidity];
  const tempData = [current.dataValues.temp];
  const condition = [[current.dataValues.sky, current.dataValues.pty]];

  shorForecast.forEach(item => {
    categories.push(item.dataValues.hour);
    rainProbData.push(item.dataValues.pop);
    humidityData.push(item.dataValues.humidity);
    tempData.push(item.dataValues.temp);
    condition.push([item.dataValues.sky, item.dataValues.pty]);
  });

  midForecast.forEach(item => {
    categories.push(item.dataValues.hour);
    rainProbData.push(item.dataValues.pop);
    humidityData.push(item.dataValues.humidity);
    tempData.push(item.dataValues.temp);
    condition.push([item.dataValues.sky, item.dataValues.pty]);
  });

  res.json({
    categories,
    rainProbData,
    humidityData,
    tempData,
    condition
  });
});

module.exports = router;
