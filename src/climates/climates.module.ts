import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { ClimateRepository } from "./climate.repository";
import { ClimatesController } from "./climates.controller";
import { ClimatesService } from "./climates.service";

@Module({
  imports: [TypeOrmModule.forFeature([CityRepository, ClimateRepository])],
  controllers: [ClimatesController],
  providers: [ClimatesService],
})
export class ClimatesModule {}
