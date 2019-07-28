const express = require("express");
const moment = require("moment-timezone");
const { Weather, Airpollution } = require("../infra/mysql");
const { getLocation } = require("../utils/geolocation.js");
const { date, cityConvert } = require("../utils/utils.js");
const { Op } = require("sequelize");

const router = express.Router();

router.get("/weather", async (req, res) => {
  const location = await getLocation(req);
  const city = cityConvert[location.data.geoLocation.r1];
  location.data.geoLocation.city = city;

  const weather = await Weather.findOne({
    where: { city, type: "current" },
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
    where: { city, type: "current" },
    order: [["air_date", "DESC"]]
  });

  weather.dataValues.pm10 = air.pm10;
  weather.dataValues.pm25 = air.pm25;

  res.json({ weather, location: location.data.geoLocation });
});

router.get("/weather/forecast", async (req, res) => {
  const location = await getLocation(req);
  const city = cityConvert[location.data.geoLocation.r1];

  const current = await Weather.findOne({
    where: { city, type: "current" }
  });

  const shorForecast = await Weather.findAll({
    where: {
      city,
      type: "short"
    },
    order: [["weather_date", "ASC"]]
  });

  const midForecast = await Weather.findAll({
    where: {
      city,
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

router.get("/weather/tomorrow", async (req, res) => {
  const tomorrow = date.tomorrow(moment.tz("Asia/Seoul"));
  const location = await getLocation(req);
  const city = cityConvert[location.data.geoLocation.r1];

  const weather = await Weather.findAll({
    where: { city, weather_date: { [Op.gte]: tomorrow } },
    limit: 8
  });

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

  res.json({
    categories,
    rainProbData,
    humidityData,
    tempData,
    condition
  });
});

router.get("/location", async (req, res) => {
  const location = await getLocation(req);

  res.send(location.data);
});

module.exports = router;
