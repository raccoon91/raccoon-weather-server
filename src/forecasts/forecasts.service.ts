import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApisService, DateService, ForecastParserService } from "src/common/providers";
import { CityRepository } from "src/cities/city.repository";
import { ForecastRepository } from "./forecast.repository";

@Injectable()
export class ForecastsService {
  logger = new Logger("ForecastsService");

  constructor(
    private api: ApisService,
    private date: DateService,
    private forecastParser: ForecastParserService,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
    @InjectRepository(ForecastRepository) private forecastRepository: ForecastRepository,
  ) {}

  async getForecasts(cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);

    const date = this.date.dayjs().format("YYYY-MM-DD HH:mm");

    return this.forecastRepository.getForecasts(city, date);
  }

  async createShortForecasts() {
    const cities = await this.cityRepository.getAllCities();

    const { baseDate, baseTime } = this.date.generateShortForecastDate();
    const promises = this.api.shortForecastPromises(cities, baseDate, baseTime);

    const responses = await Promise.all(promises);

    const createForecastsWithCityDto = responses.reduce(
      (acc, { city, shortForecast }) => acc.concat(this.forecastParser.parseShortForecast(city, shortForecast)),
      [],
    );

    const shortForecasts = await this.forecastRepository.bulkCreateOrUpdateForecasts(createForecastsWithCityDto);

    this.logger.verbose("cron short forecast");

    return shortForecasts;
  }

  async createMidForecasts() {
    const cities = await this.cityRepository.getAllCities();

    const { baseDate, baseTime } = this.date.generateMidForecastDate();
    const promises = this.api.midForecastPromises(cities, baseDate, baseTime);

    const responses = await Promise.all(promises);

    const createForecastsWithCityDto = responses.reduce(
      (acc, { city, midForecast }) => acc.concat(this.forecastParser.parseMidForecast(city, midForecast)),
      [],
    );

    const midForecasts = await this.forecastRepository.bulkCreateOrUpdateForecasts(createForecastsWithCityDto);

    this.logger.verbose("cron mid forecast");

    return midForecasts;
  }

  async createAirForecasts() {
    const cities = await this.cityRepository.getAllCities();

    const promises = this.api.airForecastPromises(["PM10", "PM25"]);

    const [pm10Response, pm25Response] = await Promise.all(promises);

    const updateAirForecastsWithCityDto = this.forecastParser.parseAirForecast(cities, pm10Response, pm25Response);

    const airForecasts = await this.forecastRepository.bulkUpdateForecastsAir(updateAirForecastsWithCityDto);

    return airForecasts;
  }
}
