import { Injectable, Logger, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { City } from "src/cities/city.entity";
import { DateService } from "./date.service";

@Injectable()
export class ApisService {
  private logger = new Logger("ApisService");
  private openWeatherApi: AxiosInstance;
  private openAirPollutionApi: AxiosInstance;
  private openCovidApi: AxiosInstance;
  private openASOSApi: AxiosInstance;

  constructor(private config: ConfigService, private date: DateService) {
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

    this.openAirPollutionApi = axios.create({
      baseURL: this.config.get("OPEN_DATA_AIR_POLLUTION_API"),
      method: "get",
      params: {
        ServiceKey: serviceKey,
        returnType: "json",
      },
    });

    this.openCovidApi = axios.create({
      baseURL: this.config.get("OPEN_DATA_COVID_API"),
      method: "get",
      params: { serviceKey },
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

  currentWeatherPromises(cities: City[], baseDate: string, baseTime: string) {
    return cities.map((city) =>
      Promise.all([
        this.openWeatherApi({
          url: "getUltraSrtNcst",
          params: {
            base_date: baseDate,
            base_time: baseTime,
            nx: city.nx,
            ny: city.ny,
          },
        }),
        this.openAirPollutionApi({
          url: "getCtprvnRltmMesureDnsty",
          params: {
            sidoName: city.korName,
            ver: "1.0",
          },
        }),
      ])
        .then((responses: [AxiosResponse<ICurrentWeatherResponse>, AxiosResponse<ICurrentAirPollutionResponse>]) => ({
          city,
          currentWeather: responses[0]?.data?.response?.body?.items?.item || [],
          airPollution: responses[1]?.data?.response?.body?.items || [],
        }))
        .catch((error) => {
          const message = `Failed to request current weather with city ${city.name} ${baseDate} / ${baseTime}`;
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
          const message = `Failed to request short forecast with city ${city.name} ${baseDate} / ${baseTime}`;
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
          const message = `Failed to request mid forecast with city ${city.name} ${baseDate} / ${baseTime}`;
          this.logger.error(message);
          this.logger.error(error);

          throw new InternalServerErrorException(message);
        }),
    );
  }

  airForecastPromises(forecastTypes: string[]) {
    const currentDate = this.date.dayjs().format("YYYY-MM-DD");

    return forecastTypes.map((type) =>
      this.openAirPollutionApi({
        url: "getMinuDustFrcstDspth",
        params: {
          informCode: type,
          searchDate: currentDate,
        },
      })
        .then((res: AxiosResponse<IAirForecastResponse>) => res?.data?.response?.body?.items || [])
        .catch((error) => {
          const message = `Failed to request air forecast with code ${type} date ${currentDate}`;
          this.logger.error(message);
          this.logger.error(error);

          throw new InternalServerErrorException(message);
        }),
    );
  }

  async covidSidoPromise(startDate: string, endDate?: string) {
    try {
      const startCreateDt = startDate;
      const endCreateDt = endDate || startDate;

      const response: AxiosResponse<ICovidSidoResponse> = await this.openCovidApi({
        url: "getCovid19SidoInfStateJson",
        params: { startCreateDt, endCreateDt },
      });

      return response?.data?.response?.body?.items?.item || [];
    } catch (error) {
      const message = `Failed to request covid sido with date ${startDate} - ${endDate}`;
      this.logger.error(message);
      this.logger.error(error);

      throw new InternalServerErrorException(message);
    }
  }

  climatesPromises(cities: City[], year: number) {
    const promises: Promise<{ city: City; dailyInfos: IASOSDailyInfoItem[] }>[] = [];
    const { startDate, endDate } = this.date.generateClimateDate(year);

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
