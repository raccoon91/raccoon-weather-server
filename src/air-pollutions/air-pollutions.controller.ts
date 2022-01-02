import { Controller, Get, Param } from "@nestjs/common";
import { AirPollutionsService } from "./air-pollutions.service";

@Controller("air-pollutions")
export class AirPollutionsController {
  constructor(private airPollutionsService: AirPollutionsService) {}

  @Get("/:cityName")
  getWeather(@Param("cityName") cityName: string) {
    return this.airPollutionsService.getAirPollution(cityName);
  }
}
