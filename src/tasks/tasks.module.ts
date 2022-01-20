import { Module } from "@nestjs/common";
import { WeathersModule } from "src/weathers/weathers.module";
import { ForecastsModule } from "src/forecasts/forecasts.module";
import { CovidsModule } from "src/covids/covids.module";
import { TasksService } from "./tasks.service";

@Module({
  imports: [WeathersModule, ForecastsModule, CovidsModule],
  providers: [TasksService],
})
export class TasksModule {}
