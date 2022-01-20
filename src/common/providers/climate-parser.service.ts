import { Injectable } from "@nestjs/common";
import { City } from "src/cities/city.entity";
import { BaseParserService } from "./base-parser.service";

@Injectable()
export class ClimateParserService extends BaseParserService {
  constructor() {
    super();
  }

  parseClimate(city: City, dailyInfos: IASOSDailyInfoItem[]) {
    const climates = dailyInfos.map((daily) => ({
      city,
      date: daily.tm,
      temp: this.toNumber(daily.avgTa),
      feel: this.getFeelTemp(daily.avgTa, daily.avgWs),
      minTemp: this.toNumber(daily.minTa),
      maxTemp: this.toNumber(daily.maxTa),
      rain: this.toNumber(daily.sumRn),
      wind: this.toNumber(daily.avgWs),
      humid: this.toNumber(daily.avgRhm),
    }));

    return climates;
  }
}
