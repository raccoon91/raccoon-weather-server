const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config.ts");
const { date, locationList } = require("../../utils/utils.js");
const { Weather } = require("../../infra/mysql");

const serviceKey = config.WEATHER_KEY;

const getForecastDate = (timestamp) => {
	let hour = timestamp.hour();
	const minute = timestamp.minute();
	let dayCalibrate = 0;

	if (minute < 30) {
		hour -= 1;
	}

	// mid forecast hour
	hour = (Math.floor((hour + 1) / 3) - 1) * 3 + 2;

	if (hour < 0) {
		hour = 23;
		dayCalibrate = 1;
	}

	return {
		forecastDate: date.dayCalibrate(timestamp, dayCalibrate),
		forecastTime: hour < 10 ? `0${hour}00` : `${hour}00`,
	};
};

const saveItem = (obj, item, value, city) => {
	const result = obj;

	if (result[`${item.fcstDate}:${item.fcstTime}`]) {
		result[`${item.fcstDate}:${item.fcstTime}`][value] = item.fcstValue;
	} else {
		result[`${item.fcstDate}:${item.fcstTime}`] = {
			city,
			weather_date: date.dateQuery(String(item.fcstDate), String(item.fcstTime)),
			hour: String(item.fcstTime).slice(0, 2),
			type: "mid",
		};
		result[`${item.fcstDate}:${item.fcstTime}`][value] = item.fcstValue;
	}

	return result;
};

const sliceData = (data, city) => {
	let result = {};

	data.forEach((item) => {
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

const isPossible = (status) => {
	if (status === 200) {
		return true;
	}

	return false;
};

const getForecast = async (location, forecastDate, forecastTime) => {
	const response = await axios.get(`http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData`, {
		params: {
			ServiceKey: decodeURIComponent(serviceKey),
			base_date: forecastDate,
			base_time: forecastTime,
			nx: location.nx,
			ny: location.ny,
			numOfRows: 184,
			_type: "json",
		},
	});

	if (!isPossible(response.status)) throw new Error("request error");

	const data = response.data.response.body.items.item;

	return sliceData(data, location.city);
};

const fillEmptyAttribute = async (response, weatherDate) => {
	const yesterdayWeather = await Weather.findOne({
		where: {
			city: response.city,
			weather_date: date.yesterday(moment(weatherDate)),
		},
	});

	if (yesterdayWeather) {
		const yesterdayData = yesterdayWeather.dataValues;

		response.yesterday_temp = yesterdayData.temp;
	}

	return response;
};

const bulkUpdateOrCreate = async (weather, response, weatherDate) => {
	if (weather) {
		let result = response;

		if (!weather.dataValues.yesterday_temp) {
			result = await fillEmptyAttribute(response, weatherDate);
		}

		weather.update(result);
	} else {
		const result = await fillEmptyAttribute(response, weatherDate);

		Weather.create(result);
	}
};

const saveMidForecast = async (forecastDate, forecastTime) => {
	const response = await axios.all(locationList.map((location) => getForecast(location, forecastDate, forecastTime)));

	for (let i = 0; i < response.length; i++) {
		const forecastTime = Object.keys(response[i]);

		for (let j = 0; j < forecastTime.length; j++) {
			const fcstDate = forecastTime[j].split(":")[0];
			const fcstTime = forecastTime[j].split(":")[1];

			const weather = await Weather.findOne({
				where: {
					city: response[i][forecastTime[j]].city,
					weather_date: date.dateQuery(fcstDate, fcstTime),
				},
			});

			await bulkUpdateOrCreate(weather, response[i][forecastTime[j]], date.dateQuery(fcstDate, fcstTime));
		}
	}
};

module.exports = () => {
	const { forecastDate, forecastTime } = getForecastDate(moment().tz("Asia/Seoul"));

	try {
		saveMidForecast(forecastDate, forecastTime);
		console.log(`[mid_forecast][SUCCESS][${forecastDate}${forecastTime}][${date.dateLog(moment.tz("Asia/Seoul"))}]`);
	} catch (err) {
		console.warn(
			`[mid_forecast][FAIL][${err.message}][${forecastDate}${forecastTime}][${date.dateLog(moment.tz("Asia/Seoul"))}]`,
		);
	}
};
