import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { AirPollutionRepository } from "./air-pollution.repository";
import { AirPollutionsController } from "./air-pollutions.controller";
import { AirPollutionsService } from "./air-pollutions.service";

@Module({
  imports: [TypeOrmModule.forFeature([AirPollutionRepository, CityRepository])],
  controllers: [AirPollutionsController],
  providers: [AirPollutionsService],
})
export class AirPollutionsModule {}
