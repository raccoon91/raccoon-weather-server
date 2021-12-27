import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCityDto, UpdateCityDto } from "./dto";
import { CityRepository } from "./city.repository";

@Injectable()
export class CitiesService {
  constructor(@InjectRepository(CityRepository) private locationRepository: CityRepository) {}

  getCities() {
    return this.locationRepository.find();
  }

  getCity(id: number) {
    return this.locationRepository.findOne({ id });
  }

  createCity(createCityDto: CreateCityDto) {
    return this.locationRepository.createCity(createCityDto);
  }

  updateCity(id: number, updateCityDto: UpdateCityDto) {
    return this.locationRepository.updateCity(id, updateCityDto);
  }

  deleteCity(id: number) {
    return this.locationRepository.deleteCity(id);
  }
}
