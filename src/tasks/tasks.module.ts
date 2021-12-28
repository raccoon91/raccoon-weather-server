import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { ClimateRepository } from "src/climates/climate.repository";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([CityRepository, ClimateRepository])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
