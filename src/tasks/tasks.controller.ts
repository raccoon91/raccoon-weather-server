import { Controller, Post, Body, ValidationPipe } from "@nestjs/common";
import { TasksService } from "./tasks.service";

@Controller("tasks")
export class TasksController {
  constructor(private schdulesService: TasksService) {}

  @Post("/weathers")
  createCurrentWeather() {
    return this.schdulesService.createCurrentWeather();
  }

  @Post("/short-forecast")
  createShortForecast() {
    return this.schdulesService.createShortForecast();
  }

  @Post("/mid-forecast")
  createMidForecast() {
    return this.schdulesService.createMidForecast();
  }

  @Post("/climates")
  createClimates(@Body(ValidationPipe) body: { startYear: number; endYear: number }) {
    const { startYear, endYear } = body;

    return this.schdulesService.createClimates(startYear, endYear);
  }
}
