import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { WeatherRepository } from "./weather.repository";

@Injectable()
export class WeathersService {
  constructor(
    @InjectRepository(WeatherRepository) private weatherRepository: WeatherRepository,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
  ) {}

  async getWeather(cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);

    return this.weatherRepository.getWeather(city);
  }
}
