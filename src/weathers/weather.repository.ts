import { EntityRepository, Repository } from "typeorm";
import { Logger, ConflictException, InternalServerErrorException } from "@nestjs/common";
import { City } from "src/cities/city.entity";
import { Weather } from "./weather.entity";
import { CreateWeatherDto, CreateWeatherWithCityDto } from "./dto";

@EntityRepository(Weather)
export class WeatherRepository extends Repository<Weather> {
  private logger = new Logger("WeatherRepository");

  getWeather(city: City) {
    return this.findOne({
      where: { city },
      order: { date: "DESC" },
    });
  }

  async createWeather(createWeatherDto: CreateWeatherDto, city: City): Promise<Weather> {
    const weather = this.create({
      ...createWeatherDto,
      city,
    });

    try {
      await this.insert(weather);

      return weather;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException("Existing city");
      } else {
        const message = `Can't create weather with city ${JSON.stringify(city)} data ${JSON.stringify(
          createWeatherDto,
        )}`;
        this.logger.error(message);
        this.logger.error(error);

        throw new InternalServerErrorException(message);
      }
    }
  }

  async bulkCreateWeathers(createWeathersWithCityDto: CreateWeatherWithCityDto[]): Promise<Weather[]> {
    const weathers = this.create(createWeathersWithCityDto);

    try {
      await this.save(weathers, { chunk: 1000 });

      return weathers;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException("Existing city");
      } else {
        const message = "Can't bulk create weathers";
        this.logger.error(message);
        this.logger.error(error);

        throw new InternalServerErrorException(message);
      }
    }
  }
}
