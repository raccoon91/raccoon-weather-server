import { Body, Controller, Get, Param, Post, ValidationPipe } from "@nestjs/common";
import { ClimatesService } from "./climates.service";
import { CreateClimateDto } from "./dto";

@Controller("climates")
export class ClimatesController {
  constructor(private climatesService: ClimatesService) {}

  @Get("/:cityName")
  getClimates(@Param("cityName") cityName: string) {
    return this.climatesService.getClimates(cityName);
  }

  @Post()
  createClimate(@Body(ValidationPipe) createClimateDto: CreateClimateDto) {
    return this.climatesService.createClimate(createClimateDto, "seoul");
  }
}
