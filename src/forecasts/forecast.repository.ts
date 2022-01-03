import { EntityRepository, Repository, MoreThan, Between } from "typeorm";
import { Logger, InternalServerErrorException } from "@nestjs/common";
import { City } from "src/cities/city.entity";
import { Forecast } from "./forecast.entity";
import { CreateForecastWithCityDto, UpdateForecastAirWithCityDto } from "./dto";

@EntityRepository(Forecast)
export class ForecastRepository extends Repository<Forecast> {
  private logger = new Logger("ForecastRepository");

  getForecasts(city: City, date: string) {
    return this.find({
      where: { city, date: MoreThan(date) },
      order: { date: "ASC" },
      take: 16,
    });
  }

  async createOrUpdateForecast(createForecastWithCityDto: CreateForecastWithCityDto) {
    try {
      await this.upsert(createForecastWithCityDto, ["city.id", "date"]);

      return createForecastWithCityDto;
    } catch (error) {
      const message = `Can't create forecast with data ${JSON.stringify(createForecastWithCityDto)}`;
      this.logger.error(message);
      this.logger.error(error);

      throw new InternalServerErrorException(message);
    }
  }

  async bulkCreateOrUpdateForecasts(createForecastsWithCityDto: CreateForecastWithCityDto[]) {
    const promises = createForecastsWithCityDto.map((createForecastWithCityDto) =>
      this.createOrUpdateForecast(createForecastWithCityDto),
    );

    const forecasts = await Promise.all(promises);

    return forecasts;
  }

  async updateForecastAir(updateForecastAirWithCityDto: UpdateForecastAirWithCityDto) {
    try {
      const { city, fromDate, toDate, pm10Grade, pm25Grade } = updateForecastAirWithCityDto;

      const foundForecasts = await this.find({
        where: { city, date: Between(fromDate, toDate) },
        order: { date: "ASC" },
      });

      const forecasts = foundForecasts.map((forecast) => ({
        ...forecast,
        city,
        pm10Grade,
        pm25Grade,
      }));

      return forecasts;
    } catch (error) {
      const message = `Can't update forecast with data ${JSON.stringify(updateForecastAirWithCityDto)}`;
      this.logger.error(message);
      this.logger.error(error);

      throw new InternalServerErrorException(message);
    }
  }

  async bulkUpdateForecastsAir(updateForecastsAirWithCityDto: UpdateForecastAirWithCityDto[]) {
    const promises = updateForecastsAirWithCityDto.map((updateForecastAirWithCityDto) =>
      this.updateForecastAir(updateForecastAirWithCityDto),
    );

    const responses = await Promise.all(promises);

    const forecasts = responses.reduce((acc, cur) => acc.concat(cur), []);

    return forecasts;
  }
}
