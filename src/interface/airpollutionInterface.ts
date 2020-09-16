import { ICityKor } from "./index";

export interface IAirPollutionResData {
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

export interface IAirPollutionData {
  city: ICityKor;
  pm10: number;
  pm25: number;
  air_date: string;
}

export interface IAirForecastResData {
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

export type IAirForecastData = {
  city: ICityKor;
  pm10: string;
  pm25: string;
  air_date: string;
};
