import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApisService, DateService, ClimateParserService } from "src/common/providers";
import { CityRepository } from "src/cities/city.repository";
import { ClimateRepository } from "./climate.repository";
import { CreateClimateWithCityDto } from "./dto";
import { CovidRepository } from "src/covids/covid.repository";

@Injectable()
export class ClimatesService {
  logger = new Logger("ClimatesService");

  constructor(
    private api: ApisService,
    private date: DateService,
    private climateParser: ClimateParserService,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
    @InjectRepository(CovidRepository) private covidRepository: CovidRepository,
    @InjectRepository(ClimateRepository) private climateRepository: ClimateRepository,
  ) {}

  async getClimates(cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);

    const climates = await this.climateRepository.getClimatesByCity(city);
    const covids = await this.covidRepository.getAllCovidsByCity(city);

    const temps: { [year: string]: number[] } = {};
    const maxTemps: { [year: string]: number[] } = {};
    const rains: { [year: string]: number } = {};
    const covidDates: string[] = [];
    const cases: number[] = [];
    const caseIncrements: number[] = [];

    climates.forEach((climate) => {
      const year = this.date.dayjs(climate.date).format("YYYY");

      if (maxTemps[year] === undefined) {
        maxTemps[year] = [];
      }

      if (temps[year] === undefined) {
        temps[year] = [];
      }

      if (rains[year] === undefined) {
        rains[year] = 0;
      }

      if (climate.maxTemp >= 32) {
        maxTemps[year].push(climate.maxTemp);
      }

      temps[year].push(climate.temp);
      rains[year] = Number((rains[year] + climate.rain).toFixed(1));
    });

    covids.forEach((covid) => {
      covidDates.push(covid.date);
      cases.push(covid.case);
      caseIncrements.push(covid.caseIncrement);
    });

    return {
      years: Object.keys(temps),
      tempClimates: Object.values(temps),
      maxTempClimates: Object.values(maxTemps),
      rainClimates: Object.values(rains),
      covidDates,
      cases,
      caseIncrements,
    };
  }

  async createClimates(startYear: number, endYear: number) {
    let climates = [];

    const cities = await this.cityRepository.getAllCities();

    for (let year = startYear; year <= endYear; year++) {
      const promises = this.api.climatesPromises(cities, year);

      const responses = await Promise.all(promises);

      const createClimatesWithCityDto: CreateClimateWithCityDto[] = responses.reduce(
        (acc, { city, dailyInfos }) => acc.concat(this.climateParser.parseClimate(city, dailyInfos)),
        [],
      );

      await this.climateRepository.createClimates(createClimatesWithCityDto);

      this.logger.verbose(`create climate year with ${year}`);

      climates = climates.concat(createClimatesWithCityDto);
    }

    return climates;
  }
}
