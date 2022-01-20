import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { CovidRepository } from "src/covids/covid.repository";
import { ForecastRepository } from "src/forecasts/forecast.repository";
import { WeatherRepository } from "./weather.repository";
import { WeathersController } from "./weathers.controller";
import { WeathersService } from "./weathers.service";

@Module({
  imports: [TypeOrmModule.forFeature([CityRepository, WeatherRepository, ForecastRepository, CovidRepository])],
  controllers: [WeathersController],
  providers: [WeathersService],
  exports: [WeathersService],
})
export class WeathersModule {}
