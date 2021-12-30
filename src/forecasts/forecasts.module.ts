import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { ForecastRepository } from "./forecast.repository";
import { ForecastsController } from "./forecasts.controller";
import { ForecastsService } from "./forecasts.service";

@Module({
  imports: [TypeOrmModule.forFeature([ForecastRepository, CityRepository])],
  controllers: [ForecastsController],
  providers: [ForecastsService],
})
export class ForecastsModule {}
