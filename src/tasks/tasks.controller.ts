import { Controller, Post, Body, ValidationPipe } from "@nestjs/common";
import { TasksService } from "./tasks.service";

@Controller("tasks")
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post("/weathers")
  createCurrentWeather() {
    return this.tasksService.createCurrentWeather();
  }

  @Post("/short-forecast")
  createShortForecast() {
    return this.tasksService.createShortForecast();
  }

  @Post("/mid-forecast")
  createMidForecast() {
    return this.tasksService.createMidForecast();
  }

  @Post("/climates")
  createClimates(@Body(ValidationPipe) body: { startYear: number; endYear: number }) {
    const { startYear, endYear } = body;

    return this.tasksService.createClimates(startYear, endYear);
  }
}
