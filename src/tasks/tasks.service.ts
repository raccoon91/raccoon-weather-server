import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApisService } from "src/apis/apis.service";
import { UtilsService } from "src/utils/utils.service";
import { CityRepository } from "src/cities/city.repository";
import { WeatherRepository } from "src/weathers/weather.repository";
import { ClimateRepository } from "src/climates/climate.repository";

@Injectable()
export class TasksService {
  private logger = new Logger("TasksService");

  constructor(
    private api: ApisService,
    private utils: UtilsService,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
    @InjectRepository(WeatherRepository) private weatherRepository: WeatherRepository,
    @InjectRepository(ClimateRepository) private climateRepository: ClimateRepository,
  ) {}

  async createCurrentWeather() {
    try {
      const cities = await this.cityRepository.getAllCities();

      const { baseDate, baseTime, formatDate } = this.utils.generateCurrentWeatherDate();
      const promises = this.api.currentWeatherPromises(cities, baseDate, baseTime, formatDate);

      const responses = await Promise.all(promises);

      const currentWeathers = responses.map(({ city, date, currentWeather }) => ({
        city,
        date,
        ...this.utils.parseCurrentWeather(currentWeather),
      }));

      // await this.weatherRepository.bulkCreateWeather(currentWeathers);

      return currentWeathers;
    } catch (error) {
      const message = `Failed to create weather`;
      this.logger.error(message);
      this.logger.error(error);

      throw new InternalServerErrorException(message);
    }
  }

  async createShortForecast() {
    try {
      const cities = await this.cityRepository.getAllCities();

      const { baseDate, baseTime } = this.utils.generateShortForecastDate();
      const promises = this.api.shortForecastPromises(cities, baseDate, baseTime);

      const responses = await Promise.all(promises);

      const shortForecasts = responses.reduce((acc, { city, shortForecast }) => {
        return acc.concat(this.utils.parseShortForecast(city, shortForecast));
      }, []);

      return shortForecasts;
    } catch (error) {
      const message = `Failed to create short forecast`;
      this.logger.error(message);
      this.logger.error(error);

      throw new InternalServerErrorException(message);
    }
  }

  async createMidForecast() {
    try {
      const cities = await this.cityRepository.getAllCities();

      const { baseDate, baseTime } = this.utils.generateMidForecastDate();
      const promises = this.api.midForecastPromises(cities, baseDate, baseTime);

      const responses = await Promise.all(promises);

      const midForecasts = responses.reduce((acc, { city, midForecast }) => {
        return acc.concat(this.utils.parseMidForecast(city, midForecast));
      }, []);

      return midForecasts;
    } catch (error) {
      const message = `Failed to create short forecast`;
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
