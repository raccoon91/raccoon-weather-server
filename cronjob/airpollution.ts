import config from "../config";
import requestAirPollutionApi from "../lib/requestAirPollutionApi";

import { bulkUpdateOrCreateAirPollution } from "../infra/mysql";

import { IPollutionResponseData, IPollutionData } from "../interface";

import { cityEngToKorDictionary } from "../utils/location";
import date from "../utils/date";

const { OPEN_WEATHER_API_KEY } = config;

const combineData = (pm10: IPollutionResponseData, pm25: IPollutionResponseData): IPollutionData[] => {
	const result: IPollutionData[] = [];

	Object.keys(cityEngToKorDictionary).forEach((city_en: string) => {
		const currentAir: IPollutionData = {
			city: cityEngToKorDictionary[city_en],
			pm10: pm10[city_en],
			pm25: pm25[city_en],
			air_date: date.format(date.today(), "YYYY-MM-DD"),
			type: "current",
		};

		result.push(currentAir);
	});

	return result;
};

const requestAirPollution = async (itemCode: string): Promise<IPollutionResponseData> => {
	const response: { status?: number; data?: { list?: IPollutionResponseData[] } } = await requestAirPollutionApi({
		method: "get",
		url: "getCtprvnMesureLIst",
		params: {
			ServiceKey: decodeURIComponent(OPEN_WEATHER_API_KEY),
			itemCode,
			dataGubun: "HOUR",
			_returnType: "json",
		},
	});

	if (response.status !== 200) {
		throw new Error(`open api request error. item: ${itemCode} status: ${response.status}`);
	}

	if (!response.data.list) throw new Error(`open api response empty. item: ${itemCode}`);

	return response.data.list[0];
};

const getAirpollution = async (): Promise<void> => {
	try {
		const pm10 = await requestAirPollution("PM10");
		const pm25 = await requestAirPollution("PM25");

		const pollutionDataList = combineData(pm10, pm25);

		await bulkUpdateOrCreateAirPollution(pollutionDataList);
	} catch (error) {
		console.error(`[airpollution request FAIL ${date.dateLog()}][${error.message}]`);
		console.error(error.stack);
	}
};

export default getAirpollution;
