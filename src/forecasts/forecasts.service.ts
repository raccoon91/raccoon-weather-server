import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { ForecastRepository } from "./forecast.repository";

@Injectable()
export class ForecastsService {
  constructor(
    @InjectRepository(ForecastRepository) private forecastRepository: ForecastRepository,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
  ) {}

  async getForecasts(cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);

    return this.forecastRepository.getForecast(city);
  }
}
