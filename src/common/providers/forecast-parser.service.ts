import { Injectable } from "@nestjs/common";
import { City } from "src/cities/city.entity";
import { UpdateForecastAirWithCityDto } from "src/forecasts/dto";
import { DateService } from "./date.service";
import { BaseParserService } from "./base-parser.service";

@Injectable()
export class ForecastParserService extends BaseParserService {
  constructor(private date: DateService) {
    super();
  }

  parseShortForecast(city: City, shortForecast: IShortForecastItem[]) {
    const parsedShortForecastObject: { [date: string]: IForecast } = {};

    shortForecast.forEach((forecast) => {
      const date = this.date.formatForecastDate(forecast.fcstDate, forecast.fcstTime);
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
      const date = this.date.formatForecastDate(forecast.fcstDate, forecast.fcstTime);
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

  combineForecastGrade(
    cities: City[],
    airForecast: { fromDate: string; toDate: string; PM10?: string; PM25?: string },
  ) {
    const { fromDate, toDate, PM10, PM25 } = airForecast;
    const parsedForecast: { [cityKorName: string]: IForecastAir } = {};

    PM10?.split(",").forEach((gradeList: any) => {
      const [cityKorName, grade] = gradeList.split(" : ");

      if (parsedForecast[cityKorName] === undefined) {
        parsedForecast[cityKorName] = { fromDate, toDate, pm10Grade: this.airForecastGrade[grade], pm25Grade: 0 };
      } else {
        parsedForecast[cityKorName].pm10Grade = this.airForecastGrade[grade];
      }
    });

    PM25?.split(",").forEach((gradeList: any) => {
      const [cityKorName, grade] = gradeList.split(" : ");

      if (parsedForecast[cityKorName] === undefined) {
        parsedForecast[cityKorName] = { fromDate, toDate, pm25Grade: this.airForecastGrade[grade], pm10Grade: 0 };
      } else {
        parsedForecast[cityKorName].pm25Grade = this.airForecastGrade[grade];
      }
    });

    return cities.map((city) => {
      const forecastByCity = parsedForecast[city.korName];

      return {
        city,
        ...forecastByCity,
      };
    });
  }

  parseAirForecast(cities: City[], pm10Response: IAirForecastItem[], pm25Response: IAirForecastItem[]) {
    const airForecasts: {
      [date: string]: { fromDate: string; toDate: string; PM10?: string; PM25?: string };
    } = {};

    pm10Response.forEach((airForecast) => {
      if (airForecasts[airForecast.informData] === undefined) {
        const { fromDate, toDate } = this.date.generateAirForecastDate(airForecast.informData);

        airForecasts[airForecast.informData] = { fromDate, toDate, [airForecast.informCode]: airForecast.informGrade };
      } else {
        airForecasts[airForecast.informData][airForecast.informCode] = airForecast.informGrade;
      }
    });

    pm25Response.forEach((airForecast) => {
      const { fromDate, toDate } = this.date.generateAirForecastDate(airForecast.informData);

      if (airForecasts[airForecast.informData] === undefined) {
        airForecasts[airForecast.informData] = { fromDate, toDate, [airForecast.informCode]: airForecast.informGrade };
      } else {
        airForecasts[airForecast.informData][airForecast.informCode] = airForecast.informGrade;
      }
    });

    const parsedAirForecasts: UpdateForecastAirWithCityDto[] = Object.values(airForecasts).reduce(
      (acc, forecast) => acc.concat(this.combineForecastGrade(cities, forecast)),
      [],
    );

    return parsedAirForecasts;
  }
}
