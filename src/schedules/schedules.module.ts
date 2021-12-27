import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { SchedulesController } from "./schedules.controller";
import { SchedulesService } from "./schedules.service";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([CityRepository])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
