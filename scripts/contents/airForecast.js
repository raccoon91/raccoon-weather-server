const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config.ts");
const { date, airpollutionLocation } = require("../../utils/utils.js");
const { Airpollution } = require("../../infra/mysql");

const serviceKey = config.WEATHER_KEY;

const sliceForecastData = (forecastList, code) => {
	const result = {};

	forecastList.forEach((item) => {
		item.informGrade.split(",").forEach((inform) => {
			const air = inform.split(" : ")[1];
			let city = inform.split(" : ")[0];

			if (city === "영동" || city === "영서") {
				city = "강원";
			} else if (city === "경기남부" || city === "경기북부") {
				city = "경기";
			}

			if (result[item.informData] === undefined) {
				result[item.informData] = {};
			}

			result[item.informData][city] = {
				[code]: air,
			};
		});
	});

	return result;
};

const sliceData = (pm10Forecast, pm25Forecast) => {
	const result = [];

	Object.keys(pm10Forecast).forEach((forecastDate) => {
		Object.keys(airpollutionLocation).forEach((city_en) => {
			const forecast = {
				city: airpollutionLocation[city_en],
				pm10: pm10Forecast[forecastDate][airpollutionLocation[city_en]].pm10,
				pm25: pm25Forecast[forecastDate][airpollutionLocation[city_en]].pm25,
				air_date: forecastDate,
				type: "forecast",
			};

			result.push(forecast);
		});
	});

	return result;
};

const isPossible = (status) => {
	if (status === 200) {
		return true;
	}

	return false;
};

const getAirForecast = async (code, today) => {
	const result = await axios.get(
		`http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMinuDustFrcstDspth`,
		{
			params: {
				ServiceKey: decodeURIComponent(serviceKey),
				searchDate: today,
				informCode: code,
				_returnType: "json",
			},
		},
	);

	if (!isPossible(result.status)) throw new Error("request error");

	let list = result.data.list;
	const dataTime = list[0].f_data_time;

	list = list.filter((item) => {
		return item.f_data_time === dataTime;
	});

	return sliceForecastData(list, code.toLowerCase());
};

const saveAirForecast = async (today) => {
	const [pm10Forecast, pm25Forecast] = await axios.all([getAirForecast("PM10", today), getAirForecast("PM25", today)]);

	const result = sliceData(pm10Forecast, pm25Forecast);

	for (let i = 0; i < result.length; i++) {
		const weather = await Airpollution.findOne({
			where: {
				city: result[i].city,
				air_date: result[i].air_date,
			},
		});

		if (weather) {
			if (weather.dataValues.type !== "current") {
				weather.update(result[i]);
			}
		} else {
			Airpollution.create(result[i]);
		}
	}
};

module.exports = () => {
	const today = moment().tz("Asia/Seoul").format("YYYY-MM-DD");

	try {
		saveAirForecast(today);

		console.log(`[airForecast][SUCCESS][${today}][${date.dateLog(moment.tz("Asia/Seoul"))}]`);
	} catch (err) {
		console.error(`[airForecast][FAIL][${err.message}][${today}][${date.dateLog(moment.tz("Asia/Seoul"))}]`);
		console.error(err.stack);
	}
};
