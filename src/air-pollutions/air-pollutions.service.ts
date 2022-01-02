import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { AirPollutionRepository } from "./air-pollution.repository";

@Injectable()
export class AirPollutionsService {
  constructor(
    @InjectRepository(AirPollutionRepository) private airPollutionRepository: AirPollutionRepository,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
  ) {}

  async getAirPollution(cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);

    return this.airPollutionRepository.getAirPollution(city);
  }
}
