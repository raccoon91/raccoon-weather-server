import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AirForecastRepository } from "./air-forecast.repository";
import { AirForecastsController } from "./air-forecasts.controller";
import { AirForecastsService } from "./air-forecasts.service";

@Module({
  imports: [TypeOrmModule.forFeature([AirForecastRepository])],
  controllers: [AirForecastsController],
  providers: [AirForecastsService],
})
export class AirForecastsModule {}
