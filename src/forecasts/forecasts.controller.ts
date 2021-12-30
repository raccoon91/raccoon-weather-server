import { Controller, Get, Param } from "@nestjs/common";
import { ForecastsService } from "./forecasts.service";

@Controller("forecasts")
export class ForecastsController {
  constructor(private forecastsService: ForecastsService) {}

  @Get("/:cityName")
  getForecasts(@Param("cityName") cityName: string) {
    return this.forecastsService.getForecasts(cityName);
  }
}
