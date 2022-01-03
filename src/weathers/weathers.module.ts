import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { WeatherRepository } from "./weather.repository";
import { WeathersController } from "./weathers.controller";
import { WeathersService } from "./weathers.service";

@Module({
  imports: [TypeOrmModule.forFeature([CityRepository, WeatherRepository])],
  controllers: [WeathersController],
  providers: [WeathersService],
  exports: [WeathersService],
})
export class WeathersModule {}
