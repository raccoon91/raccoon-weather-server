import config from "../config";
import requestAirPollutionApi from "../lib/requestAirPollutionApi";

// const { Airpollution } = require("../../infra/mysql");

import { IForecastResponseData, IForecastList, IForecastData } from "../interface/air";

import { cityEngToKorDictionary } from "../utils/location";
import date from "../utils/date";

const { OPEN_WEATHER_API_KEY } = config;

const sliceForecastData = (forecastList: IForecastResponseData[], itemCode: string): IForecastList => {
	const result = {};

	forecastList.forEach((item: IForecastResponseData): void => {
		item.informGrade.split(",").forEach((inform) => {
			let [city, air] = inform.split(" : ");

			if (city === "영동" || city === "영서") {
				city = "강원";
			} else if (city === "경기남부" || city === "경기북부") {
				city = "경기";
			}

			if (result[item.informData] === undefined) {
				result[item.informData] = {};
			}

			result[item.informData][city] = {
				[itemCode]: air,
			};
		});
	});

	return result;
};

const combineData = (pm10Forecast: IForecastList, pm25Forecast: IForecastList): IForecastData[] => {
	const result: IForecastData[] = [];

	Object.keys(pm10Forecast).forEach((forecastDate) => {
		Object.keys(cityEngToKorDictionary).forEach((city_en) => {
			const forecast: IForecastData = {
				city: cityEngToKorDictionary[city_en],
				pm10: pm10Forecast[forecastDate][cityEngToKorDictionary[city_en]].pm10,
				pm25: pm25Forecast[forecastDate][cityEngToKorDictionary[city_en]].pm25,
				air_date: forecastDate,
				type: "forecast",
			};

			result.push(forecast);
		});
	});

	return result;
};

const requestAirForecast = async (itemCode: string, today: string): Promise<IForecastList> => {
	const response: { status?: number; data?: { list?: IForecastResponseData[] } } = await requestAirPollutionApi({
		method: "get",
		url: "getMinuDustFrcstDspth",
		params: {
			ServiceKey: decodeURIComponent(OPEN_WEATHER_API_KEY),
			searchDate: today,
			informCode: itemCode,
			_returnType: "json",
		},
	});

	if (response.status !== 200) {
		throw new Error(`open api request error. item: ${itemCode} status: ${response.status}`);
	}

	if (!response.data.list) throw new Error(`open api response empty. item: ${itemCode}`);

	const { list } = response.data;
	const dataTime = list[0].f_data_time;

	const filteredList = list.filter((item: IForecastResponseData): boolean => {
		return item.f_data_time === dataTime;
	});

	return sliceForecastData(filteredList, itemCode.toLowerCase());
};

const getAirForecast = async (): Promise<IForecastData[]> => {
	try {
		const today = date.today();
		const pm10Forecast = await requestAirForecast("PM10", today);
		const pm25Forecast = await requestAirForecast("PM25", today);

		const forecastData = combineData(pm10Forecast, pm25Forecast);

		return forecastData;
	} catch (error) {
		console.error(`[air forecast request FAIL ${date.today()}][${error.message}]`);
		console.error(error.stack);
	}

	// for (let i = 0; i < result.length; i++) {
	// 	const weather = await Airpollution.findOne({
	// 		where: {
	// 			city: result[i].city,
	// 			air_date: result[i].air_date,
	// 		},
	// 	});

	// 	if (weather) {
	// 		if (weather.dataValues.type !== "current") {
	// 			weather.update(result[i]);
	// 		}
	// 	} else {
	// 		Airpollution.create(result[i]);
	// 	}
	// }
};

export default getAirForecast;
