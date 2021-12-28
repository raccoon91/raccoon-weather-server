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

    const tempClimates: { x: number; value: number }[] = [];
    const rainClimateObject: { [year: number]: { x: number; value: number } } = {};

    climates.forEach((climate) => {
      const year = dayjs(climate.date).year();

      tempClimates.push({
        x: year,
        value: climate.temp,
      });

      if (rainClimateObject[year] === undefined) {
        rainClimateObject[year] = {
          x: year,
          value: climate.rain,
        };
      } else {
        rainClimateObject[year].value += climate.rain;
      }
    });

    return { tempClimates, rainClimates: Object.values(rainClimateObject) };
  }

  async createClimate(createClimateDto: CreateClimateDto, cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);

    return this.climateRepository.createClimate(createClimateDto, city);
  }
}
