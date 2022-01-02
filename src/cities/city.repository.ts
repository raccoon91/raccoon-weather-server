import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { Logger, ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import dayjs from "dayjs";
import { City } from "./city.entity";
import { CreateCityDto, UpdateCityDto } from "./dto";

@EntityRepository(City)
export class CityRepository extends Repository<City> {
  private logger = new Logger("CityRepository");

  async getAllCities() {
    const cities = await this.find();

    if (!cities) {
      const message = "Can't find cities";
      this.logger.debug(message);

      throw new NotFoundException(message);
    }

    return cities;
  }

  async getCity(id: number) {
    const city = await this.findOne({ id });

    if (!city) {
      const message = `Can't find city with id ${id}`;
      this.logger.debug(message);

      throw new NotFoundException(message);
    }

    return city;
  }

  async getCityByName(name: string) {
    const city = await this.findOne({
      select: ["id", "name", "korName"],
      where: { name },
    });

    if (!city) {
      const message = `Can't find city with name ${name}`;
      this.logger.debug(message);

      throw new NotFoundException(message);
    }

    return city;
  }

  async getWeatherAndAirByCityName(cityName: string) {
    const currentDate = dayjs().format("YYYY-MM-DD HH:mm");

    const weatherAndAir = await this.findOne({
      select: ["id", "name", "korName"],
      join: {
        alias: "city",
        leftJoinAndSelect: {
          weathers: "city.weathers",
          airPollutions: "city.airPollutions",
        },
      },
      where: (qb: SelectQueryBuilder<City>) => {
        qb.where({ name: cityName })
          .andWhere("weathers.date <= :date", { date: currentDate })
          .andWhere("airPollutions.date <= :date", { date: currentDate })
          .addOrderBy("weathers.date", "DESC")
          .addOrderBy("airPollutions.date", "DESC")
          .limit(1);
      },
    });

    return weatherAndAir;
  }

  async createCity(createCityDto: CreateCityDto): Promise<City> {
    try {
      const city = this.create(createCityDto);

      await this.insert(city);

      return city;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException("Existing city");
      } else {
        const message = "Failed to create city";
        this.logger.error(message);
        this.logger.error(error);

        throw new InternalServerErrorException(message);
      }
    }
  }

  async bulkCreateCities(createCityDto: CreateCityDto[]): Promise<City[]> {
    try {
      const cities = this.create(createCityDto);

      await this.insert(cities);

      return cities;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException("Existing city");
      } else {
        const message = "Failed to create cities";
        this.logger.error(message);
        this.logger.error(error);

        throw new InternalServerErrorException(message);
      }
    }
  }

  async updateCity(id: number, updateCityDto: UpdateCityDto): Promise<void> {
    try {
      await this.update(id, updateCityDto);
    } catch (error) {
      const message = `Can't update city width id ${id} data ${JSON.stringify(updateCityDto)}`;
      this.logger.error(message);
      this.logger.error(error);

      throw new InternalServerErrorException(message);
    }
  }

  async deleteCity(id: number): Promise<void> {
    try {
      const result = await this.delete({ id });

      if (result.affected === 0) {
        throw new NotFoundException(`Can't find City with id ${id}`);
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
