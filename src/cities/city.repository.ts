import { EntityRepository, Repository } from "typeorm";
import { ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { City } from "./city.entity";
import { CreateCityDto, UpdateCityDto } from "./dto";

@EntityRepository(City)
export class CityRepository extends Repository<City> {
  async createCity(createCityDto: CreateCityDto): Promise<City> {
    const city = this.create(createCityDto);

    try {
      await this.insert(city);

      return city;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException("Existing city");
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async updateCity(id: number, updateCityDto: UpdateCityDto): Promise<void> {
    try {
      await this.update(id, updateCityDto);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteCity(id: number): Promise<void> {
    const result = await this.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find City with id ${id}`);
    }
  }
}
