import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import dayjs from "dayjs";
import { CityRepository } from "src/cities/city.repository";
import { ClimateRepository } from "./climate.repository";
import { CreateClimateDto } from "./dto";

@Injectable()
export class ClimatesService {
  constructor(
    @InjectRepository(ClimateRepository) private climateRepository: ClimateRepository,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
  ) {}

  async getClimates(cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);

    const climates = await this.climateRepository.getClimatesByCity(city);

    const temps: { [year: string]: number[] } = {};
    const rains: { [year: string]: number } = {};

    climates.forEach((climate) => {
      const year = dayjs(climate.date).format("YYYY");

      if (temps[year] === undefined) {
        temps[year] = [climate.temp];
      } else {
        temps[year].push(climate.temp);
      }

      if (rains[year] === undefined) {
        rains[year] = climate.rain;
      } else {
        rains[year] = Number((rains[year] + climate.rain).toFixed(1));
      }
    });

    return {
      years: Object.keys(temps),
      tempClimates: Object.values(temps),
      rainClimates: Object.values(rains),
    };
  }

  async createClimate(createClimateDto: CreateClimateDto, cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);

    return this.climateRepository.createClimate(createClimateDto, city);
  }
}
