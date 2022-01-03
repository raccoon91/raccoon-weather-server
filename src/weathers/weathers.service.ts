import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApisService, DateService, WeatherParserService } from "src/common/providers";
import { CityRepository } from "src/cities/city.repository";
import { WeatherRepository } from "./weather.repository";

@Injectable()
export class WeathersService {
  private logger = new Logger("WeathersService");

  constructor(
    private api: ApisService,
    private date: DateService,
    private weatherParser: WeatherParserService,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
    @InjectRepository(WeatherRepository) private weatherRepository: WeatherRepository,
  ) {}

  async getWeather(cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);
    const weather = await this.weatherRepository.getWeather(city);

    return weather;
  }

  async createWeathers() {
    const cities = await this.cityRepository.getAllCities();

    const { baseDate, baseTime } = this.date.generateCurrentWeatherDate();
    const promises = this.api.currentWeatherPromises(cities, baseDate, baseTime);

    const responses = await Promise.all(promises);

    const createWeathersWithCityDto = responses.map(({ city, currentWeather, airPollution }) => ({
      city,
      ...this.weatherParser.parseCurrentWeather(currentWeather),
      ...this.weatherParser.parseAirPollution(airPollution),
    }));

    const currentWeathers = await this.weatherRepository.createWeathers(createWeathersWithCityDto);

    this.logger.verbose("cron current weather");

    return currentWeathers;
  }
}
