import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { City } from "src/cities/city.entity";
import { CreateDailyWeatherDto } from "./dto";
import { CityRepository } from "src/cities/city.repository";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import dayjs from "dayjs";

@Injectable()
export class SchedulesService {
  private logger = new Logger("SchedulesService");
  private openASOSApi: AxiosInstance;

  constructor(private config: ConfigService, @InjectRepository(CityRepository) private cityRepository: CityRepository) {
    this.openASOSApi = axios.create({
      baseURL: this.config.get("OPEN_DATA_ASOS_DAILY_API"),
      method: "get",
      params: {
        serviceKey: decodeURIComponent(this.config.get("OPEN_DATA_SERVICE_KEY")),
        dataType: "JSON",
        dataCd: "ASOS",
        dateCd: "DAY",
        numOfRows: 31,
      },
    });
  }

  async createClimates(createDailyWeatherDto: CreateDailyWeatherDto) {
    const { year, month } = createDailyWeatherDto;
    const date = dayjs()
      .year(year)
      .month(month - 1);
    const lastDay = date.daysInMonth();
    const startDate = date.date(1).format("YYYYMMDD");
    const endDate = date.date(lastDay).format("YYYYMMDD");

    const cities = await this.cityRepository.getAllCities();

    try {
      const promises = cities.map((city) =>
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
            throw new Error(error);
          }),
      );

      const responses: ({ city: City; dailyInfos: IASOSDailyInfo[] } | void)[] = await Promise.all(promises);

      const climates = [];

      responses.forEach((response) => {
        if (response) {
          const { city, dailyInfos } = response;

          dailyInfos.forEach((dailyInfo) =>
            climates.push({
              date: dailyInfo.tm,
              name: city.name,
              stn: city.stn,
              temp: dailyInfo.avgTa ? Number(dailyInfo.avgTa) : 0,
              minTemp: dailyInfo.minTa ? Number(dailyInfo.minTa) : 0,
              maxTemp: dailyInfo.maxTa ? Number(dailyInfo.maxTa) : 0,
              rain: dailyInfo.sumRn ? Number(dailyInfo.sumRn) : 0,
              wind: dailyInfo.avgWs ? Number(dailyInfo.avgWs) : 0,
              humid: dailyInfo.avgRhm ? Number(dailyInfo.avgRhm) : 0,
            }),
          );
        }
      });

      return climates;
    } catch (error) {
      this.logger.error(`failed to request daily ASOS year: ${year}, month: ${month}`);
      this.logger.error(error);

      throw new InternalServerErrorException(error);
    }
  }
}
