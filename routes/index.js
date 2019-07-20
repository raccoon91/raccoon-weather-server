const express = require("express");
const { Region, Weather, Airpollution } = require("../infra/mysql");

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
      "hour"
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

module.exports = router;
