import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApisService, DateService, WeatherParserService } from "src/common/providers";
import { CityRepository } from "src/cities/city.repository";
import { ClimateRepository } from "./climate.repository";
import { CreateClimateWithCityDto } from "./dto";

@Injectable()
export class ClimatesService {
  logger = new Logger("ClimatesService");

  constructor(
    private api: ApisService,
    private date: DateService,
    private weatherParser: WeatherParserService,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
    @InjectRepository(ClimateRepository) private climateRepository: ClimateRepository,
  ) {}

  async getClimates(cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);

    const climates = await this.climateRepository.getClimatesByCity(city);

    const temps: { [year: string]: number[] } = {};
    const feelTemps: { [year: string]: number[] } = {};
    const rains: { [year: string]: number } = {};

    climates.forEach((climate) => {
      const year = this.date.dayjs(climate.date).format("YYYY");

      if (feelTemps[year] === undefined) {
        feelTemps[year] = [];
      }

      if (temps[year] === undefined) {
        temps[year] = [];
      }

      if (rains[year] === undefined) {
        rains[year] = 0;
      }

      if (climate.feel >= 30) {
        feelTemps[year].push(climate.feel);
      }

      temps[year].push(climate.temp);
      rains[year] = Number((rains[year] + climate.rain).toFixed(1));
    });

    return {
      years: Object.keys(temps),
      tempClimates: Object.values(temps),
      feelTempClimates: Object.values(feelTemps),
      rainClimates: Object.values(rains),
    };
  }

  async createClimates(startYear: number, endYear: number) {
    let climates = [];

    const cities = await this.cityRepository.getAllCities();

    for (let year = startYear; year <= endYear; year++) {
      const promises = this.api.climatesPromises(cities, year);

      const responses = await Promise.all(promises);

      const createClimatesWithCityDto: CreateClimateWithCityDto[] = responses.reduce(
        (acc, { city, dailyInfos }) => acc.concat(this.weatherParser.parseClimate(city, dailyInfos)),
        [],
      );

      await this.climateRepository.createClimates(createClimatesWithCityDto);

      this.logger.verbose(`create climate year with ${year}`);

      climates = climates.concat(createClimatesWithCityDto);
    }

    return climates;
  }
}
