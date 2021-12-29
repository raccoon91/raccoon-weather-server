import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApisModule } from "src/apis/apis.module";
import { UtilsModule } from "src/utils/utils.module";
import { CityRepository } from "src/cities/city.repository";
import { WeatherRepository } from "src/weathers/weather.repository";
import { ClimateRepository } from "src/climates/climate.repository";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [TypeOrmModule.forFeature([CityRepository, WeatherRepository, ClimateRepository]), ApisModule, UtilsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
