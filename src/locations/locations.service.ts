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

  findOne(name: string) {
    return this.locationRepository.findOneOrFail(
      { name },
      { relations: ["weathers"] },
    );
  }

  update(name: string, updateLocationInput: UpdateLocationInput) {
    return this.locationRepository.save({
      name,
      ...updateLocationInput,
    });
  }

  async remove(name: string) {
    return this.locationRepository.delete({ name });
  }
}
