import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityRepository } from "./city.repository";
import { CitiesController } from "./cities.controller";
import { CitiesService } from "./cities.service";

@Module({
  imports: [TypeOrmModule.forFeature([CityRepository])],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
