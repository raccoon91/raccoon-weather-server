import { Controller, Get, Post, Param } from "@nestjs/common";
import { WeathersService } from "./weathers.service";

@Controller("weathers")
export class WeathersController {
  constructor(private weathersService: WeathersService) {}

  @Get("/:cityName")
  getWeather(@Param("cityName") cityName: string) {
    return this.weathersService.getWeather(cityName);
  }

  @Post()
  createWeathers() {
    return this.weathersService.createWeathers();
  }
}
