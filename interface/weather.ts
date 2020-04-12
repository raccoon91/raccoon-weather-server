import { ICityKor } from "./location";

export interface ICityGeolocation {
	city: ICityKor;
	nx: number;
	ny: number;
}

type IWeatherType = "current" | "short" | "mid" | "past" | "delete";

export type IWeatherCategory =
	| "PTY" // 강수형태
	| "REH" // 습도
	| "RN1" // 1시간 강수량
	| "T1H" // 기온
	| "UUU" // 동서 바람성분
	| "VEC" // 풍향
	| "VVV" // 남북 바람성분
	| "WSD"; // 풍속

export type IShortForecastCategory =
	| "LGT" // 낙뢰
	| "PTY" // 강수형태
	| "RN1" // 1시간 강수량
	| "SKY" // 하늘상태
	| "T1H" // 기온
	| "REH" // 습도
	| "UUU" // 동서 바람성분
	| "VVV" // 남북 바람성분
	| "VEC" // 풍향
	| "WSD"; // 풍속

export type IMidForecastCategory =
	| "POP" // 강수확률
	| "PTY" // 강수형태
	| "REH" // 습도
	| "SKY" // 하늘상태
	| "T3H"; // 3시간 기온

export interface IWeatherResponseData {
	baseDate: string;
	baseTime: string;
	category: IWeatherCategory;
	nx: number;
	ny: number;
	obsrValue: number;
}

export interface IWeatherData {
	city?: ICityKor;
	temp?: number;
	yesterday_temp?: number;
	sky?: number;
	pty?: number;
	pop?: number;
	humidity?: number;
	hour?: string;
	weather_date?: string;
	type?: IWeatherType;
}

export interface IShortForecastResponseData {
	baseDate: string;
	baseTime: string;
	category: IShortForecastCategory;
	fcstDate: string;
	fcstTime: string;
	fcstValue: number;
	nx: number;
	ny: number;
}

// export interface IShortForecastData {
// 	city?: ICityKor;
// 	temp?: number;
// 	yesterday_temp?: number;
// 	sky?: number;
// 	pty?: number;
// 	pop?: number;
// 	humidity?: number;
// 	hour?: string;
// 	weather_date?: string;
// 	type?: IWeatherType;
// }

export interface IMidForecastResponseData {
	baseDate: string;
	baseTime: string;
	category: IMidForecastCategory;
	fcstDate: string;
	fcstTime: string;
	fcstValue: number;
	nx: number;
	ny: number;
}

// export interface IMidForecastData {
// 	city?: ICityKor;
// 	temp?: number;
// 	yesterday_temp?: number;
// 	sky?: number;
// 	pty?: number;
// 	pop?: number;
// 	humidity?: number;
// 	hour?: string;
// 	weather_date?: string;
// 	type?: IWeatherType;
// }
