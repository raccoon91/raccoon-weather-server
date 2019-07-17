const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config.js");
const { date, locationList } = require("../utils/utils.js");
const { Weather } = require("../../infra/mysql");

const serviceKey = config.WEATHER_KEY;

const getCurrentDate = timestamp => {
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

const getCurrentWeather = async (location, currentDate, currentTime) => {
  const result = await axios.get(
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
  );

  if (!isPossible(result.status)) throw new Error("request error");

  const data = result.data.response.body.items.item;

  return sliceData(data, location.city, currentDate, currentTime);
};

const fillEmptyAttribute = async result => {
  const res = await Weather.findOne({
    where: {
      city: result.city,
      type: "short"
    },
    order: [["weather_date", "ASC"]],
    attributes: ["sky", "pty", "pop"]
  });

  if (res) {
    const response = res.dataValues;

    result.sky = response.sky;
    result.pty = response.pty;
    result.pop = response.pop;
  }

  return result;
};

const bulkUpdateOrCreate = async (response, result) => {
  if (response) {
    if (!response.dataValues.pop) {
      result = await fillEmptyAttribute(result);
    }

    response.update(result);
  } else {
    result = await fillEmptyAttribute(result);

    Weather.create(result);
  }
};

const saveWeather = async (currentDate, currentTime) => {
  const res = await axios.all(
    locationList.map(location =>
      getCurrentWeather(location, currentDate, currentTime)
    )
  );

  for (let i = 0; i < res.length; i++) {
    const response = await Weather.findOne({
      where: {
        city: res[i].city,
        weather_date: res[i].weather_date
      }
    });

    await bulkUpdateOrCreate(response, res[i]);
  }
};

module.exports = async () => {
  const { currentDate, currentTime } = getCurrentDate(
    moment().tz("Asia/Seoul")
  );

  try {
    await saveWeather(currentDate, currentTime);
    console.log(
      `[weather][SUCCESS][${currentDate}${currentTime}][${date.dateLog(
        moment.tz("Asia/Seoul")
      )}]`
    );
  } catch (err) {
    console.error(
      `[weather][FAIL][${
        err.message
      }][${currentDate}${currentTime}][${date.dateLog(
        moment.tz("Asia/Seoul")
      )}]`
    );
    console.error(err.stack);
  }
};
