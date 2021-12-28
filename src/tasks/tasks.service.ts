import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { City } from "src/cities/city.entity";
import { CityRepository } from "src/cities/city.repository";
import { ClimateRepository } from "src/climates/climate.repository";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import dayjs from "dayjs";

@Injectable()
export class TasksService {
  private logger = new Logger("TasksService");
  private openASOSApi: AxiosInstance;

  private generateASOSPromises(cities: City[], year: number) {
    const promises: Promise<{ city: City; dailyInfos: IASOSDailyInfo[] }>[] = [];
    const currentDate = dayjs();
    const date = dayjs().year(year);
    const startDate = date.month(0).date(1).format("YYYYMMDD");
    let endDate: string;

    if (year === currentDate.year()) {
      endDate = currentDate.subtract(1, "day").format("YYYYMMDD");
    } else {
      endDate = date.month(11).date(31).format("YYYYMMDD");
    }

    for (const city of cities) {
      promises.push(
        this.openASOSApi({
          params: {
            stnIds: city.stn,
            startDt: startDate,
            endDt: endDate,
          },
        })
          .then((res: AxiosResponse<IASOSDailyInfoResponse>) => ({
            city,
            dailyInfos: res?.data?.response?.body?.items?.item || [],
          }))
          .catch((error) => {
            const message = `Failed to request ASOS city ${city.name} date ${startDate} / ${endDate}`;
            this.logger.error(message);
            this.logger.error(error);

            throw new InternalServerErrorException(message);
          }),
      );
    }

    return promises;
  }

  constructor(
    private config: ConfigService,
    @InjectRepository(CityRepository) private cityRepository: CityRepository,
    @InjectRepository(ClimateRepository) private climateRepository: ClimateRepository,
  ) {
    this.openASOSApi = axios.create({
      baseURL: this.config.get("OPEN_DATA_ASOS_DAILY_API"),
      method: "get",
      params: {
        serviceKey: decodeURIComponent(this.config.get("OPEN_DATA_SERVICE_KEY")),
        dataType: "JSON",
        dataCd: "ASOS",
        dateCd: "DAY",
        numOfRows: 370,
      },
    });
  }

  async createClimates(year: number) {
    try {
      const cities = await this.cityRepository.getAllCities();

      const promises = this.generateASOSPromises(cities, year);

      const responses = await Promise.all(promises);

      const climates = [];

      responses.forEach(({ city, dailyInfos }) => {
        dailyInfos.forEach((daily) => {
          climates.push({
            date: daily.tm,
            temp: daily.avgTa ? Number(daily.avgTa) : 0,
            minTemp: daily.minTa ? Number(daily.minTa) : 0,
            maxTemp: daily.maxTa ? Number(daily.maxTa) : 0,
            rain: daily.sumRn ? Number(daily.sumRn) : 0,
            wind: daily.avgWs ? Number(daily.avgWs) : 0,
            humid: daily.avgRhm ? Number(daily.avgRhm) : 0,
            city,
          });
        });
      });

      await this.climateRepository.bulkCreateClimate(climates);

      return climates;
    } catch (error) {
      const message = `Failed to create climates with year ${year}`;
      this.logger.error(message);
      this.logger.error(error);

      throw new InternalServerErrorException(message);
    }
  }

  async bulkCreateClimates(startYear: number, endYear: number) {
    let savedClimates = [];

    for (let year = startYear; year <= endYear; year++) {
      const climates = await this.createClimates(year);

      savedClimates = savedClimates.concat(climates);
    }

    return savedClimates;
  }
}
