import { EntityRepository, Repository, MoreThan } from "typeorm";
import { Logger, ConflictException, InternalServerErrorException } from "@nestjs/common";
import dayjs from "dayjs";
import { City } from "src/cities/city.entity";
import { Forecast } from "./forecast.entity";
import { CreateForecastWithCityDto } from "./dto";

@EntityRepository(Forecast)
export class ForecastRepository extends Repository<Forecast> {
  private logger = new Logger("ForecastRepository");

  async getForecast(city: City) {
    const currentDate = dayjs().format("YYYY-MM-DD HH:mm");

    return this.find({
      where: { city, date: MoreThan(currentDate) },
      order: { date: "ASC" },
      take: 8,
    });
  }

  async createOrUpdateForecast(createForecastwWithCityDto: CreateForecastWithCityDto): Promise<Forecast> {
    const { city, date, sky, temp, rain, rainType, rainProb, humid, wind, windDirection } = createForecastwWithCityDto;

    try {
      let forecast = await this.findOne({ where: { city, date } });

      if (forecast) {
        forecast.sky = sky ? sky : forecast.sky;
        forecast.temp = temp ? temp : forecast.temp;
        forecast.rain = rain ? rain : forecast.rain;
        forecast.rainType = rainType ? rainType : forecast.rainType;
        forecast.rainProb = rainProb ? rainProb : forecast.rainProb;
        forecast.humid = humid ? humid : forecast.humid;
        forecast.wind = wind ? wind : forecast.wind;
        forecast.windDirection = windDirection ? windDirection : forecast.windDirection;
      } else {
        forecast = this.create(createForecastwWithCityDto);
      }

      await this.save(forecast);

      return forecast;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException("Existing forecase");
      } else {
        const message = `Can't create forecast with data ${JSON.stringify(createForecastwWithCityDto)}`;
        this.logger.error(message);
        this.logger.error(error);

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
