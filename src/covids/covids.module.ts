import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { CovidRepository } from "./covid.repository";
import { CovidsController } from "./covids.controller";
import { CovidsService } from "./covids.service";

@Module({
  imports: [TypeOrmModule.forFeature([CityRepository, CovidRepository])],
  controllers: [CovidsController],
  providers: [CovidsService],
  exports: [CovidsService],
})
export class CovidsModule {}
