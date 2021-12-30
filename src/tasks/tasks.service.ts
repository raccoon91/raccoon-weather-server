import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cron } from "@nestjs/schedule";
import { ApisService } from "src/apis/apis.service";
import { UtilsService } from "src/utils/utils.service";
import { CityRepository } from "src/cities/city.repository";
import { WeatherRepository } from "src/weathers/weather.repository";
import { ClimateRepository } from "src/climates/climate.repository";
import { ForecastRepository } from "src/forecasts/forecast.repository";

@Injectable()
export class TasksService {
  private logger = new Logger("TasksService");

  constructor(
    private api: ApisService,
    private utils: UtilsService,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
    @InjectRepository(WeatherRepository) private weatherRepository: WeatherRepository,
    @InjectRepository(ForecastRepository) private forecastRepository: ForecastRepository,
    @InjectRepository(ClimateRepository) private climateRepository: ClimateRepository,
  ) {}

  @Cron("0 45 * * * *")
  async createCurrentWeather() {
    try {
      const cities = await this.cityRepository.getAllCities();

      const { baseDate, baseTime, formatDate } = this.utils.generateCurrentWeatherDate();
      const promises = this.api.currentWeatherPromises(cities, baseDate, baseTime, formatDate);

      const responses = await Promise.all(promises);

      const createWeathersWithCityDto = responses.map(({ city, date, currentWeather }) => ({
        city,
        date,
        ...this.utils.parseCurrentWeather(currentWeather),
      }));

      const currentWeathers = await this.weatherRepository.bulkCreateWeathers(createWeathersWithCityDto);

      this.logger.verbose("cron current weather");

      return currentWeathers;
    } catch (error) {
      const message = `Failed to create weather`;
      this.logger.error(message);
      this.logger.error(error);

      throw new InternalServerErrorException(message);
    }
  }

  @Cron("0 50 * * * *")
  async createShortForecast() {
    try {
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
    } catch (error) {
      const message = `Failed to create short forecast`;
      this.logger.error(message);
      this.logger.error(error);

      throw new InternalServerErrorException(message);
    }
  }

  @Cron("0 15 2,5,8,11,14,17,20,23 * * *")
  async createMidForecast() {
    try {
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
    } catch (error) {
      const message = `Failed to create mid forecast`;
      this.logger.error(message);
      this.logger.error(error);

      throw new InternalServerErrorException(message);
    }
  }

  async createClimates(startYear: number, endYear: number) {
    let climates = [];

    const cities = await this.cityRepository.getAllCities();

    for (let year = startYear; year <= endYear; year++) {
      try {
        const promises = this.api.climatesPromises(cities, year);

        const responses = await Promise.all(promises);

        const yearClimate = [];

        responses.forEach(({ city, dailyInfos }) => {
          dailyInfos.forEach((daily) => {
            yearClimate.push({
              city,
              ...this.utils.parseDailyASOS(daily),
            });
          });
        });

        await this.climateRepository.bulkCreateClimate(yearClimate);

        climates = climates.concat(yearClimate);
      } catch (error) {
        const message = `Failed to create climates with year ${year}`;
        this.logger.error(message);
        this.logger.error(error);

        throw new InternalServerErrorException(message);
      }
    }

    return climates;
  }
}
