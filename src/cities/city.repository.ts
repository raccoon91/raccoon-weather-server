import { EntityRepository, Repository, Not } from "typeorm";
import { Logger, ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
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

  async getOnlyCities() {
    const cities = await this.find({ name: Not("total") });

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
