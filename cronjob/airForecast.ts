import config from "../config";
import requestAirPollutionApi from "../lib/requestAirPollutionApi";

import { bulkUpdateOrCreateAirForecast } from "../infra/mysql";

import { IForecastResponseData, IForecastList, IPollutionData } from "../interface";

import { cityEngToKorDictionary } from "../utils/location";
import date from "../utils/date";

const { OPEN_WEATHER_API_KEY } = config;

const sliceForecastData = (forecastList: IForecastResponseData[], itemCode: string): IForecastList => {
	const result = {};

	forecastList.forEach((item: IForecastResponseData): void => {
		item.informGrade.split(",").forEach((inform) => {
			const splitedInform = inform.split(" : ");
			let city = splitedInform[0];
			const air = splitedInform[1];

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

const combineData = (pm10Forecast: IForecastList, pm25Forecast: IForecastList): IPollutionData[] => {
	const result: IPollutionData[] = [];

	Object.keys(pm10Forecast).forEach((forecastDate) => {
		Object.keys(cityEngToKorDictionary).forEach((city_en) => {
			const forecast: IPollutionData = {
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

const getAirForecast = async (): Promise<void> => {
	try {
		const today = date.format(date.today(), "YYYY-MM-DD");
		const pm10Forecast = await requestAirForecast("PM10", today);
		const pm25Forecast = await requestAirForecast("PM25", today);

		const forecastDataList = combineData(pm10Forecast, pm25Forecast);

		await bulkUpdateOrCreateAirForecast(forecastDataList);
	} catch (error) {
		console.error(`[air forecast request FAIL ${date.dateLog()}][${error.message}]`);
		console.error(error.stack);
	}
};

export default getAirForecast;
