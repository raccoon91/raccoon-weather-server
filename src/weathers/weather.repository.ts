import { EntityRepository, Repository } from "typeorm";
import { Logger, ConflictException, InternalServerErrorException } from "@nestjs/common";
import { City } from "src/cities/city.entity";
import { Weather } from "./weather.entity";
import { CreateWeatherWithCityDto } from "./dto";

@EntityRepository(Weather)
export class WeatherRepository extends Repository<Weather> {
  private logger = new Logger("WeatherRepository");

  getWeather(city: City) {
    return this.findOne({
      where: { city },
      order: { date: "DESC" },
    });
  }

  async createWeathers(createWeathersWithCityDto: CreateWeatherWithCityDto[]) {
    try {
      await this.upsert(createWeathersWithCityDto, ["city.id", "date"]);

      return createWeathersWithCityDto;
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
