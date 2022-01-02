import { Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { City } from "src/cities/city.entity";

@Injectable()
export class UtilsService {
  private readonly defaultCurrentWeather = {
    date: null,
    temp: 0,
    rain: 0,
    rainType: 0,
    humid: 0,
    wind: 0,
    windDirection: 0,
  };

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

  private airForecastGrade = {
    좋음: 1,
    보통: 2,
    나쁨: 3,
    매우나쁨: 4,
  };

  private toNumber(value: string) {
    if (typeof value !== "string") return 0;

    if (!isNaN(parseFloat(value))) {
      return parseFloat(value);
    }

    return 0;
  }

  private formatWeatherDate(weatherDate: string, weatherTime: string) {
    return dayjs(`${weatherDate} ${weatherTime}`).format("YYYY-MM-DD HH:mm");
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

    return { baseDate, baseTime };
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

      if (parsedWeather.date === null) {
        parsedWeather.date = this.formatWeatherDate(weather.baseDate, weather.baseTime);
      }

      if (currentWeatherColumn) {
        parsedWeather[currentWeatherColumn] = this.toNumber(weather.obsrValue);
      }
    });

    return parsedWeather;
  }

  parseAirPollution(airPollution: ICurrentAirPollutionItem[]) {
    let date: string;
    const pm10 = { value: 0, count: 0 };
    const pm25 = { value: 0, count: 0 };

    airPollution.forEach((pollution) => {
      if (!date && pollution.dataTime) {
        date = pollution.dataTime;
      }

      if (pollution.pm10Value) {
        pm10.value += this.toNumber(pollution.pm10Value);
        pm10.count += 1;
      }

      if (pollution.pm25Value) {
        pm25.value += this.toNumber(pollution.pm25Value);
        pm25.count += 1;
      }
    });

    return {
      date,
      pm10: Math.floor(pm10.value / pm10.count),
      pm25: Math.floor(pm25.value / pm25.count),
    };
  }

  combineForecastGrade(airForecast: { date?: string; PM10?: string; PM25?: string }) {
    const parsedForecast: { [city: string]: { city: string; date?: string; pm10?: number; pm25?: number } } = {};
    const date = airForecast.date;

    airForecast.PM10.split(",").forEach((gradeList: any) => {
      const [city, grade] = gradeList.split(" : ");

      if (parsedForecast[city] === undefined) {
        parsedForecast[city] = { city, date, pm10: this.airForecastGrade[grade] };
      } else {
        parsedForecast[city].pm10 = this.airForecastGrade[grade];
      }
    });

    airForecast.PM25.split(",").forEach((gradeList: any) => {
      const [city, grade] = gradeList.split(" : ");

      if (parsedForecast[city] === undefined) {
        parsedForecast[city] = { city, date, pm25: this.airForecastGrade[grade] };
      } else {
        parsedForecast[city].pm25 = this.airForecastGrade[grade];
      }
    });

    return Object.values(parsedForecast);
  }

  parseAirForecast(pm10Response: IAirForecastItem[], pm25Response: IAirForecastItem[]) {
    const airForecasts: { [date: string]: { date?: string; PM10?: string; PM25?: string } } = {};

    pm10Response.forEach((airForecast) => {
      if (airForecasts[airForecast.informData] === undefined) {
        airForecasts[airForecast.informData] = {
          date: airForecast.informData,
          [airForecast.informCode]: airForecast.informGrade,
        };
      } else {
        airForecasts[airForecast.informData][airForecast.informCode] = airForecast.informGrade;
      }
    });

    pm25Response.forEach((airForecast) => {
      if (airForecasts[airForecast.informData] === undefined) {
        airForecasts[airForecast.informData] = {
          [airForecast.informCode]: airForecast.informGrade,
        };
      } else {
        airForecasts[airForecast.informData][airForecast.informCode] = airForecast.informGrade;
      }
    });

    const parsedAirForecasts = Object.values(airForecasts).reduce(
      (acc, forecast) => acc.concat(this.combineForecastGrade(forecast)),
      [],
    );

    return parsedAirForecasts;
  }

  parseShortForecast(city: City, shortForecast: IShortForecastItem[]) {
    const parsedShortForecastObject: { [date: string]: IForecast } = {};

    shortForecast.forEach((forecast) => {
      const date = this.formatWeatherDate(forecast.fcstDate, forecast.fcstTime);
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
      const date = this.formatWeatherDate(forecast.fcstDate, forecast.fcstTime);
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

  parseClimate(city: City, dailyInfos: IASOSDailyInfoItem[]) {
    const climates = dailyInfos.map((daily) => ({
      city,
      date: daily.tm,
      temp: this.toNumber(daily.avgTa),
      minTemp: this.toNumber(daily.minTa),
      maxTemp: this.toNumber(daily.maxTa),
      rain: this.toNumber(daily.sumRn),
      wind: this.toNumber(daily.avgWs),
      humid: this.toNumber(daily.avgRhm),
    }));

    return climates;
  }
}
