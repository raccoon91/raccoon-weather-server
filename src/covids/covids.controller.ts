import { Controller, Get, Param, Post } from "@nestjs/common";
import { CovidsService } from "./covids.service";

@Controller("covids")
export class CovidsController {
  constructor(private covidsService: CovidsService) {}

  @Get("/:cityName")
  getWeather(@Param("cityName") cityName: string) {
    return this.covidsService.getCovid(cityName);
  }

  @Post()
  createCovids() {
    return this.covidsService.createCovids();
  }
}
