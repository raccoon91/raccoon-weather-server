import { Injectable, Logger, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { UtilsService } from "src/utils/utils.service";
import { City } from "src/cities/city.entity";

@Injectable()
export class ApisService {
  private logger = new Logger("ApisService");
  private openWeatherApi: AxiosInstance;
  private openASOSApi: AxiosInstance;

  constructor(private config: ConfigService, private utils: UtilsService) {
    const serviceKey = decodeURIComponent(this.config.get("OPEN_DATA_SERVICE_KEY"));

    this.openWeatherApi = axios.create({
      baseURL: this.config.get("OPEN_DATA_WEATHER_API"),
      method: "get",
      params: {
        ServiceKey: serviceKey,
        pageNo: 1,
        numOfRows: 1000,
        dataType: "JSON",
      },
    });

    this.openASOSApi = axios.create({
      baseURL: this.config.get("OPEN_DATA_ASOS_DAILY_API"),
      method: "get",
      params: {
        serviceKey,
        dataType: "JSON",
        dataCd: "ASOS",
        dateCd: "DAY",
        numOfRows: 370,
      },
    });
  }

  currentWeatherPromises(cities: City[], baseDate: string, baseTime: string, formatDate: string) {
    return cities.map((city) =>
      this.openWeatherApi({
        url: "getUltraSrtNcst",
        params: {
          base_date: baseDate,
          base_time: baseTime,
          nx: city.nx,
          ny: city.ny,
        },
      })
        .then((res: AxiosResponse<ICurrentWeatherResponse>) => ({
          city,
          date: formatDate,
          currentWeather: res?.data?.response?.body?.items?.item || [],
        }))
        .catch((error) => {
          const message = `Failed to request current weather with city ${city.name} ${baseDate} / ${baseTime} `;
          this.logger.error(message);
          this.logger.error(error);

          throw new InternalServerErrorException(message);
        }),
    );
  }

  shortForecastPromises(cities: City[], baseDate: string, baseTime: string) {
    return cities.map((city) =>
      this.openWeatherApi({
        url: "getUltraSrtFcst",
        params: {
          base_date: baseDate,
          base_time: baseTime,
          nx: city.nx,
          ny: city.ny,
        },
      })
        .then((res: AxiosResponse<IShortForecastResponse>) => ({
          city,
          shortForecast: res?.data?.response?.body?.items?.item || [],
        }))
        .catch((error) => {
          const message = `Failed to request short forecast with city ${city.name} ${baseDate} / ${baseTime} `;
          this.logger.error(message);
          this.logger.error(error);

          throw new InternalServerErrorException(message);
        }),
    );
  }

  midForecastPromises(cities: City[], baseDate: string, baseTime: string) {
    return cities.map((city) =>
      this.openWeatherApi({
        url: "getVilageFcst",
        params: {
          base_date: baseDate,
          base_time: baseTime,
          nx: city.nx,
          ny: city.ny,
        },
      })
        .then((res: AxiosResponse<IMidForecastResponse>) => ({
          city,
          midForecast: res?.data?.response?.body?.items?.item || [],
        }))
        .catch((error) => {
          const message = `Failed to request mid forecast with city ${city.name} ${baseDate} / ${baseTime} `;
          this.logger.error(message);
          this.logger.error(error);

          throw new InternalServerErrorException(message);
        }),
    );
  }

  climatesPromises(cities: City[], year: number) {
    const promises: Promise<{ city: City; dailyInfos: IASOSDailyInfoItem[] }>[] = [];
    const { startDate, endDate } = this.utils.generateClimateDate(year);

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
}
