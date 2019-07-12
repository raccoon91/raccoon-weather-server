const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config.js");
const { date, locationList } = require("../utils/utils.js");
const { Weather } = require("../../infra/mysql");

const serviceKey = config.WEATHER_KEY;

function calculateForecastHour(hour) {
  return (Math.floor((hour + 1) / 3) - 1) * 3 + 2;
}

function getForecastDate(timestamp) {
  let hour = timestamp.hour();
  const minute = timestamp.minute();
  let dayCalibrate = 0;

  if (minute < 30) {
    hour -= 1;
  }

  hour = calculateForecastHour(hour);

  if (hour < 0) {
    hour = 23;
    dayCalibrate = 1;
  }

  return {
    forecastDate: date.dayCalibrate(timestamp, dayCalibrate),
    forecastTime: hour < 10 ? `0${hour}00` : `${hour}00`,
    targetTime: hour
  };
}

const saveItem = (obj, item, value, city) => {
  const result = obj;

  if (result[`${item.fcstDate}:${item.fcstTime}`]) {
    result[`${item.fcstDate}:${item.fcstTime}`][value] = item.fcstValue;
  } else {
    result[`${item.fcstDate}:${item.fcstTime}`] = {
      city,
      weather_date: date.dateQuery(
        String(item.fcstDate),
        String(item.fcstTime)
      ),
      type: "mid"
    };
    result[`${item.fcstDate}:${item.fcstTime}`][value] = item.fcstValue;
  }

  return result;
};

const sliceData = (data, city) => {
  let result = {};

  data.forEach(item => {
    switch (item.category) {
      case "POP":
        result = saveItem(result, item, "pop", city);
        break;
      case "SKY":
        result = saveItem(result, item, "sky", city);
        break;
      case "PTY":
        result = saveItem(result, item, "pty", city);
        break;
      case "REH":
        result = saveItem(result, item, "humidity", city);
        break;
      case "T3H":
        result = saveItem(result, item, "temp", city);
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

const getForecast = (target, forecastDate, forecastTime) => {
  return axios
    .get(
      `http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData`,
      {
        params: {
          ServiceKey: decodeURIComponent(serviceKey),
          base_date: forecastDate,
          base_time: forecastTime,
          nx: target.nx,
          ny: target.ny,
          numOfRows: 184,
          _type: "json"
        }
      }
    )
    .then(result => {
      if (!isPossible(result.status)) throw new Error("request error");

      const data = result.data.response.body.items.item;

      return sliceData(data, target.region, forecastDate, forecastTime);
    });
};

module.exports = () => {
  const { forecastDate, forecastTime } = getForecastDate(
    moment().tz("Asia/Seoul")
  );

  axios
    .all(
      locationList.map(target =>
        getForecast(target, forecastDate, forecastTime)
      )
    )
    .then(res => {
      res.forEach(result => {
        Object.keys(result).forEach(async key => {
          const fcstDate = key.split(":")[0];
          const fcstTime = key.split(":")[1];

          await Weather.findOne({
            where: {
              city: result[key].city,
              weather_date: date.dateQuery(fcstDate, fcstTime)
            }
          }).then(response => {
            if (response) {
              response.update(result[key]);
            } else {
              Weather.create(result[key]);
            }
          });
        });
      });
    })
    .then(() => {
      console.log(`[mid_forecast][SUCCESS][${forecastDate}${forecastTime}]`);
    })
    .catch(err => {
      console.log(
        `[mid_forecast][FAIL][${err.message}][${forecastDate}${forecastTime}]`
      );
    });
};
