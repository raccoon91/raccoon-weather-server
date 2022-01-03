import { Module } from "@nestjs/common";
import { WeathersModule } from "src/weathers/weathers.module";
import { ForecastsModule } from "src/forecasts/forecasts.module";
import { TasksService } from "./tasks.service";

@Module({
  imports: [WeathersModule, ForecastsModule],
  providers: [TasksService],
})
export class TasksModule {}
