interface IOpenApiResponse<T> {
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

type ICurrentWeatherResponse = IOpenApiResponse<ICurrentWeatherItem>;

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
type IShortForecastResponse = IOpenApiResponse<IShortForecastItem>;

type IMidForecastCategory = "POP" | "PTY" | "PCP" | "REH" | "SKY" | "TMP" | "TMN" | "TMX" | "VEC" | "WSD";
type IMidForecastItem = IForecastItem<IMidForecastCategory>;
type IMidForecastResponse = IOpenApiResponse<IMidForecastItem>;

interface IASOSDailyInfoItem {
  tm: string;
  avgTa: string;
  minTa: string;
  maxTa: string;
  sumRn: string;
  avgWs: string;
  avgRhm: string;
}

type IASOSDailyInfoResponse = IOpenApiResponse<IASOSDailyInfoItem>;
