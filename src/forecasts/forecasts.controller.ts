import { Controller, Get, Post, Param } from "@nestjs/common";
import { ForecastsService } from "./forecasts.service";

@Controller("forecasts")
export class ForecastsController {
  constructor(private forecastsService: ForecastsService) {}

  @Get("/:cityName")
  getForecasts(@Param("cityName") cityName: string) {
    return this.forecastsService.getForecasts(cityName);
  }

  @Post("/short")
  createShortForecasts() {
    return this.forecastsService.createShortForecasts();
  }

  @Post("/mid")
  createMidForecasts() {
    return this.forecastsService.createMidForecasts();
  }

  @Post("/air")
  createAirForecasts() {
    return this.forecastsService.createAirForecasts();
  }
}
