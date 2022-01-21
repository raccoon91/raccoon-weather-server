import { Body, Controller, Get, Param, Post, ValidationPipe } from "@nestjs/common";
import { CovidsService } from "./covids.service";
import { CreateCovidsByDateDto } from "./dto";

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

  @Post("/scrap")
  createCovidsByDate(@Body(ValidationPipe) body: CreateCovidsByDateDto) {
    const { startDate, endDate } = body;

    return this.covidsService.createCovidsByDate(startDate, endDate);
  }
}
