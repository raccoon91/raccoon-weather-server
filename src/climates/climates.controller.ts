import { Body, Controller, Delete, Get, Param, Post, ValidationPipe } from "@nestjs/common";
import { ClimatesService } from "./climates.service";
import { ClimatesByYearDto } from "./dto";

@Controller("climates")
export class ClimatesController {
  constructor(private climatesService: ClimatesService) {}

  @Get("/:cityName")
  getClimates(@Param("cityName") cityName: string) {
    return this.climatesService.getClimates(cityName);
  }

  @Post()
  createClimates(@Body(ValidationPipe) body: ClimatesByYearDto) {
    const { startYear, endYear } = body;

    return this.climatesService.createClimates(startYear, endYear);
  }

  @Delete()
  deleteClimates(@Body(ValidationPipe) body: ClimatesByYearDto) {
    const { startYear, endYear } = body;

    return this.climatesService.deleteClimates(startYear, endYear);
  }
}
