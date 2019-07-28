const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config.js");
const { date, locationList } = require("../../utils/utils.js");
const { Weather } = require("../../infra/mysql");
const { Op } = require("sequelize");

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
  const response = await axios.get(
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

  if (!isPossible(response.status)) throw new Error("request error");

  const data = response.data.response.body.items.item;

  return sliceData(data, location.city, currentDate, currentTime);
};

const fillEmptyAttribute = async (response, yesterday, currentTime) => {
  let weather = await Weather.findOne({
    where: {
      city: response.city,
      type: "short"
    },
    order: [["weather_date", "ASC"]],
    attributes: ["sky", "pty", "pop"]
  });

  if (!weather) {
    weather = await Weather.findOne({
      where: {
        city: response.city,
        type: "mid"
      },
      order: [["weather_date", "ASC"]],
      attributes: ["sky", "pty", "pop"]
    });
  }

  const yesterdayWeather = await Weather.findOne({
    where: {
      city: response.city,
      weather_date: date.dateQuery(yesterday, currentTime)
    }
  });

  if (weather) {
    const weatherData = weather.dataValues;

    response.sky = weatherData.sky;
    response.pty = weatherData.pty;
    response.pop = weatherData.pop;
  }

  if (yesterdayWeather) {
    const yesterdayData = yesterdayWeather.dataValues;

    response.yesterday_temp = yesterdayData.temp;

    await yesterdayWeather.update({ type: "delete" });
  }

  return response;
};

const bulkUpdateOrCreate = async (
  weather,
  response,
  yesterday,
  currentTime
) => {
  fillEmptyAttribute(response, yesterday, currentTime);
  if (weather) {
    let result = response;

    if (!weather.dataValues.yesterday_temp) {
      result = await fillEmptyAttribute(response, yesterday, currentTime);
    }

    weather.update(result);
  } else {
    const result = await fillEmptyAttribute(response, yesterday, currentTime);

    Weather.create(result);
  }
};

const changePastWeatherType = async pastWeather => {
  for (let i = 0; i < pastWeather.length; i++) {
    if (pastWeather[i] && pastWeather[i].dataValues.type !== "delete") {
      pastWeather[i].update({ type: "past" });
    }
  }
};

const saveWeather = async (currentDate, currentTime, yesterday) => {
  const response = await axios.all(
    locationList.map(location =>
      getCurrentWeather(location, currentDate, currentTime)
    )
  );

  for (let i = 0; i < response.length; i++) {
    const weather = await Weather.findOne({
      where: {
        city: response[i].city,
        weather_date: response[i].weather_date
      }
    });

    const pastWeather = await Weather.findAll({
      where: {
        weather_date: {
          [Op.lt]: response[i].weather_date
        }
      }
    });

    await bulkUpdateOrCreate(weather, response[i], yesterday, currentTime);
    await changePastWeatherType(pastWeather);
  }
};

module.exports = async () => {
  const { currentDate, currentTime, yesterday } = getCurrentDate(
    moment().tz("Asia/Seoul")
  );

  try {
    await saveWeather(currentDate, currentTime, yesterday);
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
