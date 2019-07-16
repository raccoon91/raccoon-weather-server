const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config.js");
const { date, locationList } = require("../utils/utils.js");
const { Weather } = require("../../infra/mysql");

const serviceKey = config.WEATHER_KEY;
const { currentDate, currentTime } = (timestamp => {
  let hour = timestamp.hour();
  const minute = timestamp.minute();
  let dayCalibrate = 0;

  if (minute < 30) {
    hour -= 1;
  }

  if (hour < 0) {
    hour = 23;
    dayCalibrate = 1;
  }

  return {
    currentDate: date.dayCalibrate(timestamp, dayCalibrate),
    yesterday: date.dayCalibrate(timestamp, dayCalibrate + 1),
    currentTime: hour < 10 ? `0${hour}00` : `${hour}00`
  };
})(moment().tz("Asia/Seoul"));

const sliceData = (data, city) => {
  const result = {
    city,
    weather_date: date.dateQuery(currentDate, currentTime),
    hour: currentTime.slice(0, 2),
    type: "current"
  };

  data.forEach(item => {
    switch (item.category) {
      case "T1H":
        result.temp = item.obsrValue;
        break;
      case "REH":
        result.humidity = item.obsrValue;
        break;
      default:
        break;
    }
  });

  return result;
};

const isPossible = status => {
  if (status === 200) {
    return true;
  }

  return false;
};

const getCurrentWeather = location => {
  return axios
    .get(
      `http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastGrib`,
      {
        params: {
          ServiceKey: decodeURIComponent(serviceKey),
          base_date: currentDate,
          base_time: currentTime,
          nx: location.nx,
          ny: location.ny,
          _type: "json"
        }
      }
    )
    .then(result => {
      if (!isPossible(result.status)) throw new Error("request error");

      const data = result.data.response.body.items.item;

      return sliceData(data, location.city);
    });
};

const saveWeather = () => {
  axios
    .all(locationList.map(location => getCurrentWeather(location)))
    .then(res => {
      res.forEach(result => {
        Weather.findOne({
          where: {
            city: result.city,
            weather_date: result.weather_date
          }
        }).then(async response => {
          if (response) {
            if (!response.dataValues.pop) {
              await Weather.findOne({
                where: {
                  city: result.city,
                  type: "short"
                },
                order: [["weather_date", "ASC"]],
                attributes: ["sky", "pty", "pop"]
              }).then(res => {
                if (res) {
                  const response = res.dataValues;

                  result.sky = response.sky;
                  result.pty = response.pty;
                  result.pop = response.pop;
                }
              });
            }

            response.update(result);
          } else {
            await Weather.findOne({
              where: {
                city: result.city,
                type: "short"
              },
              order: [["weather_date", "ASC"]],
              attributes: ["sky", "pty", "pop"]
            }).then(res => {
              if (res) {
                const response = res.dataValues;

                result.sky = response.sky;
                result.pty = response.pty;
                result.pop = response.pop;
              }
            });

            Weather.create(result);
          }
        });
      });
    });
};

module.exports = () => {
  try {
    saveWeather();
    console.log(
      `[weather][SUCCESS][${currentDate}${currentTime}][${date.dateLog(
        moment.tz("Asia/Seoul")
      )}]`
    );
  } catch (err) {
    console.warn(
      `[weather][FAIL][${
        err.message
      }][${currentDate}${currentTime}][${date.dateLog(
        moment.tz("Asia/Seoul")
      )}]`
    );
  }
};
