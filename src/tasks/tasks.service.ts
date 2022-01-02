import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cron } from "@nestjs/schedule";
import { ApisService } from "src/apis/apis.service";
import { UtilsService } from "src/utils/utils.service";
import { CityRepository } from "src/cities/city.repository";
import { WeatherRepository } from "src/weathers/weather.repository";
import { AirPollutionRepository } from "src/air-pollutions/air-pollution.repository";
import { ForecastRepository } from "src/forecasts/forecast.repository";
import { ClimateRepository } from "src/climates/climate.repository";
import { CreateClimateWithCityDto } from "src/climates/dto";

@Injectable()
export class TasksService {
  private logger = new Logger("TasksService");

  constructor(
    private api: ApisService,
    private utils: UtilsService,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
    @InjectRepository(WeatherRepository) private weatherRepository: WeatherRepository,
    @InjectRepository(AirPollutionRepository) private airPollutionRepository: AirPollutionRepository,
    @InjectRepository(ForecastRepository) private forecastRepository: ForecastRepository,
    @InjectRepository(ClimateRepository) private climateRepository: ClimateRepository,
  ) {}

  @Cron("0 45 * * * *")
  async createCurrentWeather() {
    const cities = await this.cityRepository.getAllCities();

    const { baseDate, baseTime } = this.utils.generateCurrentWeatherDate();
    const promises = this.api.currentWeatherPromises(cities, baseDate, baseTime);

    const responses = await Promise.all(promises);

    const createWeathersWithCityDto = responses.map(({ city, currentWeather }) => ({
      city,
      ...this.utils.parseCurrentWeather(currentWeather),
    }));

    const currentWeathers = await this.weatherRepository.bulkCreateWeathers(createWeathersWithCityDto);

    this.logger.verbose("cron current weather");

    return currentWeathers;
  }

  @Cron("0 20 * * * *")
  async createAirPollution() {
    const cities = await this.cityRepository.getAllCities();

    const promises = this.api.airPollutionPromises(cities);

    const responses = await Promise.all(promises);

    const createAirPollutionWithCityDto = responses.map(({ city, airPollution }) => ({
      city,
      ...this.utils.parseAirPollution(airPollution),
    }));

    const airPollutions = await this.airPollutionRepository.bulkCreateAirPollutions(createAirPollutionWithCityDto);

    return airPollutions;
  }

  async createAirForecast() {
    const promises = this.api.airForecastPromises(["PM10", "PM25"]);

    const [pm10Response, pm25Response] = await Promise.all(promises);

    const createAirForecastWithCityDto = this.utils.parseAirForecast(pm10Response, pm25Response);

    return createAirForecastWithCityDto;
  }

  @Cron("0 50 * * * *")
  async createShortForecast() {
    const cities = await this.cityRepository.getAllCities();

    const { baseDate, baseTime } = this.utils.generateShortForecastDate();
    const promises = this.api.shortForecastPromises(cities, baseDate, baseTime);

    const responses = await Promise.all(promises);

    const createForecastsWithCityDto = responses.reduce(
      (acc, { city, shortForecast }) => acc.concat(this.utils.parseShortForecast(city, shortForecast)),
      [],
    );

    const shortForecasts = await this.forecastRepository.bulkCreateOrUpdateForecasts(createForecastsWithCityDto);

    this.logger.verbose("cron short forecast");

    return shortForecasts;
  }

  @Cron("0 15 2,5,8,11,14,17,20,23 * * *")
  async createMidForecast() {
    const cities = await this.cityRepository.getAllCities();

    const { baseDate, baseTime } = this.utils.generateMidForecastDate();
    const promises = this.api.midForecastPromises(cities, baseDate, baseTime);

    const responses = await Promise.all(promises);

    const createForecastsWithCityDto = responses.reduce(
      (acc, { city, midForecast }) => acc.concat(this.utils.parseMidForecast(city, midForecast)),
      [],
    );

    const midForecasts = await this.forecastRepository.bulkCreateOrUpdateForecasts(createForecastsWithCityDto);

    this.logger.verbose("cron mid forecast");

    return midForecasts;
  }

  async createClimates(startYear: number, endYear: number) {
    let climates = [];

    const cities = await this.cityRepository.getAllCities();

    for (let year = startYear; year <= endYear; year++) {
      const promises = this.api.climatesPromises(cities, year);

      const responses = await Promise.all(promises);

      const createClimatesWithCityDto: CreateClimateWithCityDto[] = responses.reduce(
        (acc, { city, dailyInfos }) => acc.concat(this.utils.parseClimate(city, dailyInfos)),
        [],
      );

      await this.climateRepository.bulkCreateClimate(createClimatesWithCityDto);

      this.logger.verbose(`cron climate year with ${year}`);

      climates = climates.concat(createClimatesWithCityDto);
    }

    return climates;
  }
}
