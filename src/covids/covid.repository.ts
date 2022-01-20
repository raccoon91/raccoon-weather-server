import { EntityRepository, Repository } from "typeorm";
import { Logger, InternalServerErrorException } from "@nestjs/common";
import { City } from "src/cities/city.entity";
import { Covid } from "./covid.entity";
import { CreateCovidWithCityDto } from "./dto";

@EntityRepository(Covid)
export class CovidRepository extends Repository<Covid> {
  private logger = new Logger("CovidRepository");

  getCovidByCity(city: City) {
    return this.findOne({
      where: { city },
      order: { date: "DESC" },
    });
  }

  async createCovids(createCovidsWithCityDto: CreateCovidWithCityDto[]) {
    try {
      await this.upsert(createCovidsWithCityDto, ["city.id", "date"]);

      return createCovidsWithCityDto;
    } catch (error) {
      const message = "Can't bulk create covids";
      this.logger.error(message);
      this.logger.error(error);

      throw new InternalServerErrorException(message);
    }
  }
}
