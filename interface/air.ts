export type IKoCity =
	| "서울"
	| "제주"
	| "전남"
	| "전북"
	| "광주"
	| "경남"
	| "경북"
	| "울산"
	| "대구"
	| "부산"
	| "충남"
	| "충북"
	| "세종"
	| "대전"
	| "강원"
	| "경기"
	| "인천";

export type IEnCity =
	| "seoul"
	| "chungbuk"
	| "busan"
	| "chungnam"
	| "daegu"
	| "daejeon"
	| "gangwon"
	| "gwangju"
	| "gyeongbuk"
	| "gyeonggi"
	| "gyeongnam"
	| "incheon"
	| "jeju"
	| "jeonbuk"
	| "jeonnam"
	| "sejong"
	| "ulsan";

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
	city: string;
	pm10: number;
	pm25: number;
	air_date: string;
	type: IAirDataType;
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
	[key in IKoCity]: { [key in IItemCode]: string };
};

export type IForecastList = {
	[key: string]: IForecast;
};

export interface IForecastData {
	city: IKoCity;
	pm10: string;
	pm25: string;
	air_date: string;
	type: IAirDataType;
}
