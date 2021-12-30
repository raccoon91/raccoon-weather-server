import { EntityRepository, Repository, MoreThan } from "typeorm";
import { Logger, ConflictException, InternalServerErrorException } from "@nestjs/common";
import dayjs from "dayjs";
import { City } from "src/cities/city.entity";
import { Forecast } from "./forecast.entity";
import { CreateForecastWithCityDto } from "./dto";

@EntityRepository(Forecast)
export class ForecastRepository extends Repository<Forecast> {
  private logger = new Logger("ForecastRepository");

  getForecast(city: City) {
    const currentDate = dayjs().format("YYYY-MM-DD HH:mm");

    return this.find({
      where: { city, date: MoreThan(currentDate) },
      order: { date: "ASC" },
      take: 16,
    });
  }

  async createOrUpdateForecast(createForecastwWithCityDto: CreateForecastWithCityDto): Promise<Forecast> {
    const { city, date, sky, temp, rain, rainType, rainProb, humid, wind, windDirection } = createForecastwWithCityDto;

    try {
      const foundForecast = await this.findOne({ where: { city, date } });
      let forecast: Forecast;

      if (foundForecast) {
        forecast = Object.assign({}, foundForecast);

        forecast.sky = sky ? sky : foundForecast.sky;
        forecast.temp = temp ? temp : foundForecast.temp;
        forecast.rain = rain ? rain : foundForecast.rain;
        forecast.rainType = rainType ? rainType : foundForecast.rainType;
        forecast.rainProb = rainProb ? rainProb : foundForecast.rainProb;
        forecast.humid = humid ? humid : foundForecast.humid;
        forecast.wind = wind ? wind : foundForecast.wind;
        forecast.windDirection = windDirection ? windDirection : foundForecast.windDirection;
      } else {
        forecast = this.create(createForecastwWithCityDto);
      }

      await this.upsert(forecast, ["city.id", "date"]);

      return forecast;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException(`Existing forecast with data ${JSON.stringify(createForecastwWithCityDto)}`);
      } else {
        const message = `Can't create forecast with data ${JSON.stringify(createForecastwWithCityDto)}`;
        this.logger.error(message);

        throw new InternalServerErrorException(message);
      }
    }
  }

  async bulkCreateOrUpdateForecasts(createForecastsWithCityDto: CreateForecastWithCityDto[]): Promise<Forecast[]> {
    const promises = createForecastsWithCityDto.map((createForecastWithCityDto) =>
      this.createOrUpdateForecast(createForecastWithCityDto),
    );

    const forecasts = await Promise.all(promises);

    return forecasts;
  }
}
