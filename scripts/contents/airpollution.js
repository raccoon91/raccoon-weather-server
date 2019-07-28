const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config.js");
const { date, airpollutionLocation } = require("../../utils/utils.js");
const { Airpollution } = require("../../infra/mysql");

const serviceKey = config.WEATHER_KEY;

const sliceData = (pm10, pm25) => {
  const result = [];

  Object.keys(airpollutionLocation).forEach(city_en => {
    const currentAir = {
      city: airpollutionLocation[city_en],
      pm10: pm10[city_en],
      pm25: pm25[city_en],
      air_date: moment().tz("Asia/Seoul"),
      type: "current"
    };

    result.push(currentAir);
  });

  return result;
};

const isPossible = status => {
  if (status === 200) {
    return true;
  }

  return false;
};

const getAirpollution = async itemCode => {
  const response = await axios.get(
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
  );

  if (!isPossible(response.status)) throw new Error("request error");

  return response.data.list[0];
};

const saveAirpollution = async () => {
  const [pm10, pm25] = await axios.all([
    getAirpollution("PM10"),
    getAirpollution("PM25")
  ]);

  const result = sliceData(pm10, pm25);

  for (let i = 0; i < result.length; i++) {
    const weather = await Airpollution.findOne({
      where: {
        city: result[i].city,
        air_date: result[i].air_date
      }
    });

    if (weather) {
      weather.update(result[i]);
    } else {
      Airpollution.create(result[i]);
    }
  }
};

module.exports = () => {
  const today = moment()
    .tz("Asia/Seoul")
    .format("YYYY-MM-DD");

  try {
    saveAirpollution();

    console.log(
      `[airpollution][SUCCESS][${today}][${date.dateLog(
        moment.tz("Asia/Seoul")
      )}]`
    );
  } catch (err) {
    console.error(
      `[airpollution][FAIL][${err.message}][${today}][${date.dateLog(
        moment.tz("Asia/Seoul")
      )}]`
    );
    console.error(err.stack);
  }
};
