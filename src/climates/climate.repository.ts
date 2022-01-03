import { EntityRepository, Repository } from "typeorm";
import { Logger, ConflictException, InternalServerErrorException } from "@nestjs/common";
import { City } from "src/cities/city.entity";
import { Climate } from "./climate.entity";
import { CreateClimateWithCityDto } from "./dto";

@EntityRepository(Climate)
export class ClimateRepository extends Repository<Climate> {
  private logger = new Logger("ClimateRepository");

  async getClimatesByCity(city: City) {
    const climate = await this.find({
      where: { city },
      order: { date: "ASC" },
    });

    return climate;
  }

  async createClimates(createClimatesWithCityDto: CreateClimateWithCityDto[]): Promise<Climate[]> {
    try {
      const climates = this.create(createClimatesWithCityDto);

      await this.save(climates, { chunk: 1000 });

      return climates;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException("Existing city");
      } else {
        const message = "Can't bulk create climates";
        this.logger.error(message);
        this.logger.error(error);

        throw new InternalServerErrorException(message);
      }
    }
  }
}
