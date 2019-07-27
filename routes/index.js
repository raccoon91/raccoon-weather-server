const express = require("express");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const config = require("../config.js");
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

router.get("/location", (req, res) => {
  (() => {
    const { ACCESS_KEY, SECRET_KEY } = config;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const timeStamp = Math.floor(+new Date()).toString();
    const sortedSet = {};

    sortedSet.ip = ip === "127.0.0.1" || ip === "::1" ? "211.36.142.207" : ip;
    sortedSet.ext = "t";
    sortedSet.responseFormatType = "json";

    let queryString = Object.keys(sortedSet).reduce((prev, curr) => {
      return `${prev}${curr}=${sortedSet[curr]}&`;
    }, "");

    queryString = queryString.substr(0, queryString.length - 1);

    const baseString = `${config.requestUrl}?${queryString}`;
    const signature = makeSignature(
      SECRET_KEY,
      "GET",
      baseString,
      timeStamp,
      ACCESS_KEY
    );
    const options = {
      headers: {
        "x-ncp-apigw-timestamp": timeStamp,
        "x-ncp-iam-access-key": ACCESS_KEY,
        "x-ncp-apigw-signature-v2": signature
      }
    };

    axios
      .get(`${config.hostName}${baseString}`, options)
      .then(response => {
        res.send(response.data);
      })
      .catch(err => {
        console.log(err.response.data);
        res.send(`naver geolocation error`);
      });
  })();
});

const makeSignature = (secretKey, method, baseString, timestamp, accessKey) => {
  const space = " ";
  const newLine = "\n";
  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

  hmac.update(method);
  hmac.update(space);
  hmac.update(baseString);
  hmac.update(newLine);
  hmac.update(timestamp);
  hmac.update(newLine);
  hmac.update(accessKey);
  const hash = hmac.finalize();

  return hash.toString(CryptoJS.enc.Base64);
};

module.exports = router;
