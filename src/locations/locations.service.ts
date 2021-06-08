import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateLocationInput, UpdateLocationInput } from "./location.dto";
import { Location } from "./location.entity";

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  parseLocation(location: Location) {
    const { countryCode, city, stnId, weathers } = location;
    const tempData = [];
    const rainData = [];
    const humidData = [];

    weathers.forEach((weather) => {
      const { date, temp, rain, humid } = weather;

      tempData.push({ date, temp });
      rainData.push({ date, rain });
      humidData.push({ date, humid });
    });

    return {
      countryCode,
      city,
      stnId,
      length: weathers.length,
      tempData,
      rainData,
      humidData,
    };
  }

  async create(createLocationInput: CreateLocationInput) {
    const location = this.locationRepository.create(createLocationInput);

    return this.locationRepository.save(location);
  }

  async findAll() {
    const locations = await this.locationRepository
      .createQueryBuilder("locations")
      .leftJoinAndSelect("locations.weathers", "weathers")
      .orderBy("date", "ASC")
      .getMany();

    return locations.map(this.parseLocation);
  }

  async findOne(city: string) {
    const location = await this.locationRepository
      .createQueryBuilder("locations")
      .where("locations.'city' = :city", { city })
      .leftJoinAndSelect("locations.weathers", "weathers")
      .orderBy("date", "ASC")
      .getOne();

    return this.parseLocation(location);
  }

  update(city: string, updateLocationInput: UpdateLocationInput) {
    return this.locationRepository.save({
      city,
      ...updateLocationInput,
    });
  }

  async remove(city: string) {
    return this.locationRepository.delete({ city });
  }
}
