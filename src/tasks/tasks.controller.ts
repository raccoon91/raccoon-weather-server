import { Controller, Post, Body } from "@nestjs/common";
import { TasksService } from "./tasks.service";

@Controller("tasks")
export class TasksController {
  constructor(private schdulesService: TasksService) {}

  @Post("/climates")
  createClimates(@Body() body: { year?: number; startYear?: number; endYear?: number }) {
    const { year, startYear, endYear } = body;

    if (year) {
      return this.schdulesService.createClimates(year);
    }

    if (startYear && endYear) {
      return this.schdulesService.bulkCreateClimates(startYear, endYear);
    }
  }
}
