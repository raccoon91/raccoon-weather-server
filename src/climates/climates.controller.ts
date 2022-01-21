import { Body, Controller, Get, Param, Post, ValidationPipe } from "@nestjs/common";
import { ClimatesService } from "./climates.service";
import { CreateClimatesByYearDto } from "./dto";

@Controller("climates")
export class ClimatesController {
  constructor(private climatesService: ClimatesService) {}

  @Get("/:cityName")
  getClimates(@Param("cityName") cityName: string) {
    return this.climatesService.getClimates(cityName);
  }

  @Post()
  createClimates(@Body(ValidationPipe) body: CreateClimatesByYearDto) {
    const { startYear, endYear } = body;

    return this.climatesService.createClimates(startYear, endYear);
  }
}
