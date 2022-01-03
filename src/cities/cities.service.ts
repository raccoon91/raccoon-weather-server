import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCityDto, UpdateCityDto } from "./dto";
import { CityRepository } from "./city.repository";

@Injectable()
export class CitiesService {
  constructor(@InjectRepository(CityRepository) private cityRepository: CityRepository) {}

  getCities() {
    return this.cityRepository.getAllCities();
  }

  getCity(id: number) {
    return this.cityRepository.getCity(id);
  }

  createCities(createCityDto: CreateCityDto[]) {
    return this.cityRepository.bulkCreateCities(createCityDto);
  }

  updateCity(id: number, updateCityDto: UpdateCityDto) {
    return this.cityRepository.updateCity(id, updateCityDto);
  }

  deleteCity(id: number) {
    return this.cityRepository.deleteCity(id);
  }
}
