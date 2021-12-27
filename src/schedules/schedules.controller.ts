import { Controller, Post, Body, ValidationPipe } from "@nestjs/common";
import { SchedulesService } from "./schedules.service";
import { CreateDailyWeatherDto } from "./dto";

@Controller("schedules")
export class SchedulesController {
  constructor(private schdulesService: SchedulesService) {}

  @Post("/climates")
  createClimates(@Body(ValidationPipe) createDailyWeatherDto: CreateDailyWeatherDto) {
    return this.schdulesService.createClimates(createDailyWeatherDto);
  }
}
