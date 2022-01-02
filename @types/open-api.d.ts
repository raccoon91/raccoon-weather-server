interface IOpenApiWeatherResponse<T> {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      dataType: "JSON";
      items: { item: T[] };
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

interface ICity {
  id: number;
  name: string;
  stn: number;
  nx: number;
  ny: number;
}

interface ICurrentWeather {
  date: string;
  temp: number;
  rain: number;
  rainType: number;
  humid: number;
  wind: number;
  windDirection: number;
}

interface ICurrentWeatherItem {
  baseDate: string;
  baseTime: string;
  category: "PTY" | "REH" | "RN1" | "T1H" | "VEC" | "WSD";
  nx: number;
  ny: number;
  obsrValue: string;
}

type ICurrentWeatherResponse = IOpenApiWeatherResponse<ICurrentWeatherItem>;

interface IForecast {
  city: ICity;
  date: string;
  sky: number;
  temp: number;
  rain: number;
  rainType: number;
  rainProb: number;
  humid: number;
  wind: number;
  windDirection: number;
}

interface IForecastItem<T> {
  baseDate: string;
  baseTime: string;
  category: T;
  nx: number;
  ny: number;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
}

type IShortForecastCatetory = "T1H" | "RN1" | "SKY" | "REH" | "PTY" | "VEC" | "WSD";
type IShortForecastItem = IForecastItem<IShortForecastCatetory>;
type IShortForecastResponse = IOpenApiWeatherResponse<IShortForecastItem>;

type IMidForecastCategory = "POP" | "PTY" | "PCP" | "REH" | "SKY" | "TMP" | "TMN" | "TMX" | "VEC" | "WSD";
type IMidForecastItem = IForecastItem<IMidForecastCategory>;
type IMidForecastResponse = IOpenApiWeatherResponse<IMidForecastItem>;

interface IASOSDailyInfoItem {
  tm: string;
  avgTa: string;
  minTa: string;
  maxTa: string;
  sumRn: string;
  avgWs: string;
  avgRhm: string;
}

type IASOSDailyInfoResponse = IOpenApiWeatherResponse<IASOSDailyInfoItem>;

interface IOpenApiAirPollutionResponse<T> {
  response: {
    header: { resultMsg: string; resultCode: string };
    body: {
      items: T[];
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

interface ICurrentAirPollutionItem {
  dataTime: string;
  sidoName: string;
  stationName: string;
  pm10Flag: null;
  pm10Grade: string;
  pm10Value: string;
  pm25Flag: null;
  pm25Grade: string;
  pm25Value: string;
}

type ICurrentAirPollutionResponse = IOpenApiAirPollutionResponse<ICurrentAirPollutionItem>;

interface IAirForecastItem {
  informCode: string;
  informData: string;
  informGrade: string;
}

type IAirForecastResponse = IOpenApiAirPollutionResponse<IAirForecastItem>;
