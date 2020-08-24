import { ICityKor } from "./index";

export interface ICityGeolocation {
  city: ICityKor;
  nx?: number;
  ny?: number;
  stn?: number;
}

export type IWeatherCategory =
  | "T1H" // 기온
  | "RN1" // 1시간 강수량
  | "UUU" // 동서바람성분
  | "VVV" // 남북바람성분
  | "REH" // 습도
  | "PTY" // 강수형태
  | "VEC" // 풍향
  | "WSD"; // 풍속

export type IShortForecastCategory =
  | "T1H" // 기온
  | "RN1" // 1시간 강수량
  | "SKY" // 하늘상태
  | "UUU" // 동서바람성분
  | "VVV" // 남북바람성분
  | "REH" // 습도
  | "PTY" // 강수형태
  | "LGT" // 낙뢰
  | "VEC" // 풍향
  | "WSD"; // 풍속

export type IMidForecastCategory =
  | "POP" // 강수확률
  | "PTY" // 강수형태
  | "R06" // 6시간 강수량
  | "REH" // 습도
  | "S06" // 6시간 신적설
  | "SKY" // 하늘상태
  | "T3H" // 3시간 기온
  | "TMN" // 아침 최저기온
  | "TMX" // 낮 최고기온
  | "UUU" // 풍속(동서성분)
  | "VVV" // 풍속(남북성분)
  | "WAV" // 파고
  | "VEC" // 풍향
  | "WSD"; // 풍속

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
  max_temp?: number;
  min_temp?: number;
  sky?: number;
  pty?: number;
  pop?: number;
  rn1?: number;
  humidity?: number;
  lgt?: number;
  hour?: string;
  weather_date?: string;
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

export interface IShortForecastData {
  city?: ICityKor;
  temp?: number;
  sky?: number;
  pty?: number;
  rn1?: number;
  lgt?: number;
  humidity?: number;
  hour?: string;
  weather_date?: string;
}

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

export interface IMidForecastData {
  city?: ICityKor;
  t3h?: number;
  max_temp?: number;
  min_temp?: number;
  sky?: number;
  pty?: number;
  pop?: number;
  humidity?: number;
  hour?: string;
  weather_date?: string;
}
