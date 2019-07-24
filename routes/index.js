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

router.get("/weather/rain", async (req, res) => {
  const current = await Weather.findOne({
    where: { city: "서울", type: "current" }
  });

  const forecast = await Weather.findAll({
    where: {
      city: "서울",
      [Op.or]: [{ type: "short" }, { type: "mid" }]
    },
    limit: 7
  });

  const categories = [current.dataValues.hour];
  const rainProbData = [current.dataValues.pop];
  const humidityData = [current.dataValues.humidity];
  const tempData = [current.dataValues.temp];

  forecast.forEach(item => {
    categories.push(item.dataValues.hour);
    rainProbData.push(item.dataValues.pop);
    humidityData.push(item.dataValues.humidity);
    tempData.push(item.dataValues.temp);
  });

  res.json({
    series: [
      {
        name: "Rain Probability",
        data: rainProbData
      }
    ],
    chartOptions: {
      chart: {
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        toolbar: {
          show: false
        }
      },
      colors: ["#77B6EA"],
      dataLabels: {
        enabled: true
      },
      stroke: {
        curve: "smooth",
        width: 2
      },
      markers: {
        size: 6
      },
      xaxis: {
        categories,
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          show: false
        },
        axisBorder: {
          show: false
        }
      },
      grid: {
        show: false
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5
      }
    }
  });
});

module.exports = router;
