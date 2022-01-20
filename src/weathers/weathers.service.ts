import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApisService, DateService, WeatherParserService } from "src/common/providers";
import { CityRepository } from "src/cities/city.repository";
import { WeatherRepository } from "./weather.repository";
import { ForecastRepository } from "src/forecasts/forecast.repository";
import { CovidRepository } from "src/covids/covid.repository";

@Injectable()
export class WeathersService {
  private logger = new Logger("WeathersService");

  constructor(
    private api: ApisService,
    private date: DateService,
    private weatherParser: WeatherParserService,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
    @InjectRepository(WeatherRepository) private weatherRepository: WeatherRepository,
    @InjectRepository(ForecastRepository) private forecastRepository: ForecastRepository,
    @InjectRepository(CovidRepository) private covidRepository: CovidRepository,
  ) {}

  async getWeather(cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);
    const weather = await this.weatherRepository.getWeather(city);
    const forecast = await this.forecastRepository.getForecast(city, weather.date);
    const covid = await this.covidRepository.getCovidByCity(city);

    return {
      city,
      ...weather,
      sky: forecast?.sky || 0,
      rainType: forecast?.rainType || 0,
      rainProb: forecast?.rainProb || 0,
      case: covid.case,
      caseIncrement: covid.caseIncrement,
    };
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

    this.logger.verbose("create current weather");

    return currentWeathers;
  }
}
