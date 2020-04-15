import { ICityKor } from "./location";

export type IItemCode = "pm10" | "pm25";

export type IAirDataType = "current" | "forecast";

export interface IPollutionResponseData {
	_returnType: "json";
	dataTime: string;
	busan: string;
	chungbuk: string;
	chungnam: string;
	daegu: string;
	daejeon: string;
	gangwon: string;
	gwangju: string;
	gyeongbuk: string;
	gyeonggi: string;
	gyeongnam: string;
	incheon: string;
	jeju: string;
	jeonbuk: string;
	jeonnam: string;
	sejong: string;
	seoul: string;
	ulsan: string;
}

export interface IPollutionData {
	city?: string;
	pm10?: number;
	pm25?: number;
	air_date?: string;
	type?: IAirDataType;
}

export interface IForecastResponseData {
	_returnType: "json";
	dataTime: string;
	f_data_time: string;
	f_data_time1: string;
	f_data_time2: string;
	f_data_time3: string;
	f_inform_data: string;
	informCode: "PM10" | "PM25";
	informData: string;
	informGrade: string;
}

export type IForecast = {
	[key in ICityKor]: { [key in IItemCode]: string };
};

export type IForecastList = {
	[key: string]: IForecast;
};

// export interface IForecastData {
// 	city: ICityKor;
// 	pm10: string;
// 	pm25: string;
// 	air_date: string;
// 	type: IAirDataType;
// }
