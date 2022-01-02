import { EntityRepository, Repository, MoreThan } from "typeorm";
import { Logger, ConflictException, InternalServerErrorException } from "@nestjs/common";
import dayjs from "dayjs";
import { City } from "src/cities/city.entity";
import { AirForecast } from "./air-forecast.entity";
import { CreateAirForecastWithCityDto } from "./dto";

@EntityRepository(AirForecast)
export class AirForecastRepository extends Repository<AirForecast> {
  private logger = new Logger("AirForecastRepository");

  getAirForecast(city: City) {
    const currentDate = dayjs().format("YYYY-MM-DD HH:mm");

    return this.find({
      where: { city, date: MoreThan(currentDate) },
      order: { date: "ASC" },
      take: 16,
    });
  }

  async createOrUpdateAirForecast(createAirForecastWithCityDto: CreateAirForecastWithCityDto): Promise<AirForecast> {
    try {
      let airForecast: AirForecast;
      const { city, date, pm10Grade, pm25Grade } = createAirForecastWithCityDto;

      const foundAirForecast = await this.findOne({ where: { city, date } });

      if (foundAirForecast) {
        airForecast = Object.assign({}, foundAirForecast);

        airForecast.pm10Grade = pm10Grade ? pm10Grade : foundAirForecast.pm10Grade;
        airForecast.pm25Grade = pm25Grade ? pm25Grade : foundAirForecast.pm25Grade;
      } else {
        airForecast = this.create(createAirForecastWithCityDto);
      }

      await this.upsert(airForecast, ["city.id", "date"]);

      return airForecast;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException(`Existing air forecast with data ${JSON.stringify(createAirForecastWithCityDto)}`);
      } else {
        const message = `Can't create air forecast with data ${JSON.stringify(createAirForecastWithCityDto)}`;
        this.logger.error(message);

        throw new InternalServerErrorException(message);
      }
    }
  }

  async bulkCreateOrUpdateAirForecasts(
    createAirForecastsWithCityDto: CreateAirForecastWithCityDto[],
  ): Promise<AirForecast[]> {
    const promises = createAirForecastsWithCityDto.map((createAirForecastWithCityDto) =>
      this.createOrUpdateAirForecast(createAirForecastWithCityDto),
    );

    const airForecasts = await Promise.all(promises);

    return airForecasts;
  }
}
