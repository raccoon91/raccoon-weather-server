import { Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { City } from "src/cities/city.entity";

@Injectable()
export class UtilsService {
  private readonly defaultCurrentWeather = { temp: 0, rain: 0, rainType: 0, humid: 0, wind: 0, windDirection: 0 };

  private readonly defaultForecast = {
    sky: 0,
    temp: 0,
    rain: 0,
    rainType: 0,
    rainProb: 0,
    humid: 0,
    wind: 0,
    windDirection: 0,
  };

  private currentWeatherKey = {
    T1H: "temp",
    RN1: "rain",
    PTY: "rainType",
    REH: "humid",
    WSD: "wind",
    VEC: "windDirection",
  };

  private shortForecastKey = {
    SKY: "sky",
    T1H: "temp",
    RN1: "rain",
    PTY: "rainType",
    REH: "humid",
    WSD: "wind",
    VEC: "windDirection",
  };

  private midForecastKey = {
    SKY: "sky",
    TMP: "temp",
    PCP: "rain",
    PTY: "rainType",
    POP: "rainProb",
    REH: "humid",
    WSD: "wind",
    VEC: "windDirection",
  };

  private toNumber(value: string) {
    if (typeof value !== "string") return 0;

    if (!isNaN(parseFloat(value))) {
      return parseFloat(value);
    }

    return 0;
  }

  private formatForecastDate(fcstDate: string, fcstTime: string) {
    return dayjs(`${fcstDate} ${fcstTime}`).format("YYYY-MM-DD HH:mm");
  }

  generateClimateDate(year: number) {
    const currentDate = dayjs();
    const date = dayjs().year(year);
    const startDate = date.month(0).date(1).format("YYYYMMDD");
    let endDate: string;

    if (year === currentDate.year()) {
      endDate = currentDate.subtract(1, "day").format("YYYYMMDD");
    } else {
      endDate = date.month(11).date(31).format("YYYYMMDD");
    }

    return { startDate, endDate };
  }

  generateCurrentWeatherDate() {
    const currentDate = dayjs().subtract(40, "minute");
    const baseDate = currentDate.format("YYYYMMDD");
    const baseTime = currentDate.format("HH00");

    return { baseDate, baseTime, formatDate: currentDate.format("YYYY-MM-DD HH:mm") };
  }

  generateShortForecastDate() {
    const currentDate = dayjs().subtract(45, "minute");
    const baseDate = currentDate.format("YYYYMMDD");
    const baseTime = currentDate.format("HH30");

    return { baseDate, baseTime };
  }

  generateMidForecastDate() {
    let currentDate = dayjs().subtract(10, "minute");
    let currentHour = currentDate.hour();

    if (currentHour < 2) {
      currentDate = currentDate.subtract(1, "day");
      currentHour = currentHour = 23;
    }

    const midForecastHour = Math.floor((currentHour + 1) / 3) * 3 - 1;
    currentDate.hour(midForecastHour);

    const baseDate = currentDate.format("YYYYMMDD");

    return { baseDate, baseTime: `${midForecastHour}10` };
  }

  parseCurrentWeather(currentWeather: ICurrentWeatherItem[]) {
    const parsedWeather: ICurrentWeather = Object.assign({}, this.defaultCurrentWeather);

    currentWeather.forEach((weather) => {
      const currentWeatherColumn = this.currentWeatherKey[weather.category];

      if (currentWeatherColumn) {
        parsedWeather[currentWeatherColumn] = this.toNumber(weather.obsrValue);
      }
    });

    return parsedWeather;
  }

  parseShortForecast(city: City, shortForecast: IShortForecastItem[]) {
    const parsedShortForecastObject: { [date: string]: IForecast } = {};

    shortForecast.forEach((forecast) => {
      const date = this.formatForecastDate(forecast.fcstDate, forecast.fcstTime);
      const shortForecastColumn = this.shortForecastKey[forecast.category];

      if (parsedShortForecastObject[date] === undefined) {
        parsedShortForecastObject[date] = { city, date, ...this.defaultForecast };
      }

      if (shortForecastColumn) {
        parsedShortForecastObject[date][shortForecastColumn] = this.toNumber(forecast.fcstValue);
      }
    });

    return Object.values(parsedShortForecastObject);
  }

  parseMidForecast(city: City, midForecast: IMidForecastItem[]) {
    const parsedMidForecastObject: { [date: string]: IForecast } = {};

    midForecast.forEach((forecast) => {
      const date = this.formatForecastDate(forecast.fcstDate, forecast.fcstTime);
      const midForecastColumn = this.midForecastKey[forecast.category];

      if (parsedMidForecastObject[date] === undefined) {
        parsedMidForecastObject[date] = { city, date, ...this.defaultForecast };
      }

      if (midForecastColumn) {
        parsedMidForecastObject[date][midForecastColumn] = this.toNumber(forecast.fcstValue);
      }
    });

    return Object.values(parsedMidForecastObject);
  }

  parseDailyASOS(daily: IASOSDailyInfoItem) {
    return {
      date: daily.tm,
      temp: this.toNumber(daily.avgTa),
      minTemp: this.toNumber(daily.minTa),
      maxTemp: this.toNumber(daily.maxTa),
      rain: this.toNumber(daily.sumRn),
      wind: this.toNumber(daily.avgWs),
      humid: this.toNumber(daily.avgRhm),
    };
  }
}
