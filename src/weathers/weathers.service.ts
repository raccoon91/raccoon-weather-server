import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AirPollutionRepository } from "src/air-pollutions/air-pollution.repository";
import { CityRepository } from "src/cities/city.repository";
import { WeatherRepository } from "./weather.repository";

@Injectable()
export class WeathersService {
  constructor(
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
    @InjectRepository(WeatherRepository) private weatherRepository: WeatherRepository,
    @InjectRepository(AirPollutionRepository) private airPollutionRepository: AirPollutionRepository,
  ) {}

  async getWeather(cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);
    const weather = await this.weatherRepository.getWeather(city);
    const airPollution = await this.airPollutionRepository.getAirPollution(city);

    return { city, weather, airPollution };
  }
}
