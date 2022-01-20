import { Injectable } from "@nestjs/common";
import { DateService } from "./date.service";
import { BaseParserService } from "./base-parser.service";

@Injectable()
export class WeatherParserService extends BaseParserService {
  constructor(private date: DateService) {
    super();
  }

  parseCurrentWeather(currentWeather: ICurrentWeatherItem[]) {
    const parsedWeather: ICurrentWeather = Object.assign({}, this.defaultCurrentWeather);

    currentWeather.forEach((weather) => {
      const currentWeatherColumn = this.currentWeatherKey[weather.category];

      if (parsedWeather.date === null) {
        parsedWeather.date = this.date.formatWeatherDate(weather.baseDate, weather.baseTime);
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
}
