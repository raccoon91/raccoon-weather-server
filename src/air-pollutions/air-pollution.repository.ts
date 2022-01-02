import { EntityRepository, Repository, LessThanOrEqual } from "typeorm";
import { Logger, ConflictException, InternalServerErrorException } from "@nestjs/common";
import dayjs from "dayjs";
import { City } from "src/cities/city.entity";
import { AirPollution } from "./air-pollution.entity";
import { CreateAirPollutionWithCityDto } from "./dto";

@EntityRepository(AirPollution)
export class AirPollutionRepository extends Repository<AirPollution> {
  private logger = new Logger("AirPollutionRepository");

  getAirPollution(city: City) {
    const currentDate = dayjs().format("YYYY-MM-DD HH:mm");

    return this.findOne({
      where: { city, date: LessThanOrEqual(currentDate) },
      order: { date: "DESC" },
    });
  }

  async createAirPollution(createAirPollutionWithCityDto: CreateAirPollutionWithCityDto): Promise<AirPollution> {
    try {
      const airPollution = this.create(createAirPollutionWithCityDto);

      await this.insert(airPollution);

      return airPollution;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException("Existing city");
      } else {
        const message = `Can't create air pollution with data ${JSON.stringify(createAirPollutionWithCityDto)}`;
        this.logger.error(message);
        this.logger.error(error);

        throw new InternalServerErrorException(message);
      }
    }
  }

  async bulkCreateAirPollutions(
    createAirPollutionsWithCityDto: CreateAirPollutionWithCityDto[],
  ): Promise<AirPollution[]> {
    try {
      const airPollutions = this.create(createAirPollutionsWithCityDto);

      await this.save(airPollutions, { chunk: 1000 });

      return airPollutions;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException("Existing city");
      } else {
        const message = "Can't bulk create air pollutions";
        this.logger.error(message);
        this.logger.error(error);

        throw new InternalServerErrorException(message);
      }
    }
  }
}
