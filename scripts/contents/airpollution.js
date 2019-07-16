const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config.js");
const { date, airpollutionLocation } = require("../utils/utils.js");
const { Airpollution } = require("../../infra/mysql");

const serviceKey = config.WEATHER_KEY;

const sliceForecastData = (data, code) => {
  const result = {};

  data.forEach(item => {
    item.informGrade.split(",").forEach(inform => {
      const air = inform.split(" : ")[1];
      let city = inform.split(" : ")[0];

      if (city === "영동" || city === "영서") {
        city = "강원";
      } else if (city === "경기남부" || city === "경기북부") {
        city = "경기";
      }

      result[city] = {
        [code]: air
      };
    });
  });

  return result;
};

const sliceData = (pm10, pm25, pm10Forecast, pm25Forecast) => {
  const result = [];
  Object.keys(airpollutionLocation).forEach(city_en => {
    const temp = {
      city: airpollutionLocation[city_en],
      pm10: pm10[city_en],
      pm25: pm25[city_en],
      pm10_tomorrow: pm10Forecast[airpollutionLocation[city_en]].pm10,
      pm25_tomorrow: pm25Forecast[airpollutionLocation[city_en]].pm25,
      air_date: moment().tz("Asia/Seoul")
    };

    result.push(temp);
  });

  return result;
};

const isPossible = status => {
  if (status === 200) {
    return true;
  }

  return false;
};

const getAirForecast = (code, today, tomorrow) => {
  return axios
    .get(
      `http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMinuDustFrcstDspth`,
      {
        params: {
          ServiceKey: decodeURIComponent(serviceKey),
          searchDate: today,
          informCode: code,
          _returnType: "json"
        }
      }
    )
    .then(result => {
      if (!isPossible(result.status)) throw new Error("request error");

      let list = result.data.list;
      const dataTime = list[0].f_data_time;

      list = list.filter(item => {
        return item.f_data_time === dataTime && item.f_inform_data === tomorrow;
      });

      return sliceForecastData(list, code.toLowerCase());
    });
};

const getAirpollution = itemCode => {
  return axios
    .get(
      `http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureLIst`,
      {
        params: {
          ServiceKey: decodeURIComponent(serviceKey),
          itemCode,
          dataGubun: "HOUR",
          searchCondition: "WEEK",
          pageNo: 1,
          numOfRows: 1,
          _returnType: "json"
        }
      }
    )
    .then(result => {
      if (!isPossible(result.status)) throw new Error("request error");

      return result.data.list[0];
    });
};

const saveAirpollution = (today, tomorrow) => {
  axios
    .all([
      getAirpollution("PM10"),
      getAirpollution("PM25"),
      getAirForecast("PM10", today, tomorrow),
      getAirForecast("PM25", today, tomorrow)
    ])
    .then(
      axios.spread((pm10, pm25, pm10Forecast, pm25Forecast) => {
        return sliceData(pm10, pm25, pm10Forecast, pm25Forecast);
      })
    )
    .then(res => {
      res.forEach(result => {
        Airpollution.findOne({
          where: {
            city: result.city,
            air_date: result.air_date
          }
        }).then(async response => {
          if (response) {
            response.update(result);
          } else {
            Airpollution.create(result);
          }
        });
      });
    });
};

module.exports = () => {
  const today = moment()
    .tz("Asia/Seoul")
    .format("YYYY-MM-DD");
  const tomorrow = date.tomorrow(moment().tz("Asia/Seoul"));

  try {
    saveAirpollution(today, tomorrow);
    console.log(
      `[airpollution][SUCCESS][${today}][${date.dateLog(
        moment.tz("Asia/Seoul")
      )}]`
    );
  } catch (err) {
    console.warn(
      `[airpollution][FAIL][${err.message}][${today}][${date.dateLog(
        moment.tz("Asia/Seoul")
      )}]`
    );
  }
};
