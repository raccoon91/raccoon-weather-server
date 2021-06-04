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

  create(createLocationInput: CreateLocationInput) {
    const location = this.locationRepository.create(createLocationInput);

    return this.locationRepository.save(location);
  }

  findAll() {
    return this.locationRepository.find({ relations: ["weathers"] });
  }

  findOne(city: string) {
    return this.locationRepository.findOneOrFail(
      { city },
      { relations: ["weathers"] },
    );
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
