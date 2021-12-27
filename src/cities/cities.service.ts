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

  createCity(createCityDto: CreateCityDto) {
    return this.cityRepository.createCity(createCityDto);
  }

  updateCity(id: number, updateCityDto: UpdateCityDto) {
    return this.cityRepository.updateCity(id, updateCityDto);
  }

  deleteCity(id: number) {
    return this.cityRepository.deleteCity(id);
  }
}
