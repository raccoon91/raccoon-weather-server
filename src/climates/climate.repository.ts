import { EntityRepository, Repository, Between } from "typeorm";
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

  async createClimates(createClimatesWithCityDto: CreateClimateWithCityDto[]) {
    try {
      await this.upsert(createClimatesWithCityDto, ["city.id", "date"]);

      return createClimatesWithCityDto;
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

  async deleteClimates(startYear: number, endYear: number) {
    try {
      const climates = await this.find({
        where: {
          date: Between(`${startYear}-01-01`, `${endYear}-12-31`),
        },
      });

      const result = await this.remove(climates);

      return result;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
