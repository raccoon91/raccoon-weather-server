import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { WeathersService } from "src/weathers/weathers.service";
import { ForecastsService } from "src/forecasts/forecasts.service";
import { CovidsService } from "src/covids/covids.service";

@Injectable()
export class TasksService {
  constructor(
    private weathersService: WeathersService,
    private forecastsService: ForecastsService,
    private covidsService: CovidsService,
  ) {}

  @Cron("0 45 * * * *")
  async createWeathers() {
    return this.weathersService.createWeathers();
  }

  @Cron("0 50 * * * *")
  async createShortForecasts() {
    return this.forecastsService.createShortForecasts();
  }

  @Cron("0 15 2,5,8,11,14,17,20,23 * * *")
  async createMidForecasts() {
    return this.forecastsService.createMidForecasts();
  }

  @Cron("0 0 10 * * *")
  async cronCovids() {
    return this.covidsService.createCovids();
  }

  // async createAirForecasts() {
  //   return this.forecastsService.createAirForecasts();
  // }
}
