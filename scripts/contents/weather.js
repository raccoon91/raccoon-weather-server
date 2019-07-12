const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config.js");
const { date, location } = require("../utils/utils.js");
const { Weather } = require("../../infra/mysql");

const serviceKey = config.weather_key;

const getcurrentDate = timestamp => {
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
};

const sliceData = (data, city, currentDate, currentTime) => {
  const result = {
    city,
    current_date: date.dateQuery(currentDate, currentTime)
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

const getCurrentWeather = (target, currentDate, currentTime) => {
  return axios
    .get(
      `http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastGrib`,
      {
        params: {
          ServiceKey: decodeURIComponent(serviceKey),
          base_date: currentDate,
          base_time: currentTime,
          nx: target.nx,
          ny: target.ny,
          _type: "json"
        }
      }
    )
    .then(result => {
      if (!isPossible(result.status)) throw new Error("request error");

      const data = result.data.response.body.items.item;

      return sliceData(data, target.region, currentDate, currentTime);
    });
};

module.exports = () => {
  const { currentDate, currentTime } = getcurrentDate(
    moment().tz("Asia/Seoul")
  );

  axios
    .all(
      location.map(target =>
        getCurrentWeather(target, currentDate, currentTime)
      )
    )
    .then(res => {
      res.forEach(result => {
        Weather.findOne({
          where: {
            city: result.city,
            current_date: result.current_date
          }
        }).then(response => {
          if (response) {
            response.update(result);
          } else {
            Weather.create(result);
          }
        });
      });
    })
    .then(() => {
      console.log(`[weather][SUCCESS][${currentDate}${currentTime}]`);
    })
    .catch(err => {
      console.log(
        `[weather][FAIL][${err.message}][${currentDate}${currentTime}]`
      );
    });
};
