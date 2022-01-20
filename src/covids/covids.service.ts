import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CityRepository } from "src/cities/city.repository";
import { ApisService, DateService, CovidParserService } from "src/common/providers";
import { CovidRepository } from "./covid.repository";

@Injectable()
export class CovidsService {
  private logger = new Logger("CovidsService");

  constructor(
    private api: ApisService,
    private date: DateService,
    private covidParser: CovidParserService,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
    @InjectRepository(CovidRepository) private covidRepository: CovidRepository,
  ) {}

  async getCovid(cityName: string) {
    const city = await this.cityRepository.getCityByName(cityName);
    const covid = await this.covidRepository.getCovidByCity(city);

    return covid;
  }

  async createCovids() {
    const currentDate = this.date.dayjs().format("YYYYMMDD");

    const cities = await this.cityRepository.getAllCities();
    const responses = await this.api.covidSidoPromise(currentDate);

    const CreateWeatherWithCityDto = this.covidParser.parseCovidSido(cities, responses);

    const covids = await this.covidRepository.createCovids(CreateWeatherWithCityDto);

    this.logger.verbose("create covid");

    return covids;
  }
}
