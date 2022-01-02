import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { AirPollutionRepository } from "src/air-pollutions/air-pollution.repository";
import { WeatherRepository } from "./weather.repository";
import { WeathersController } from "./weathers.controller";
import { WeathersService } from "./weathers.service";

@Module({
  imports: [TypeOrmModule.forFeature([CityRepository, WeatherRepository, AirPollutionRepository])],
  controllers: [WeathersController],
  providers: [WeathersService],
})
export class WeathersModule {}
