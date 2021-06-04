import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateWeatherInput, UpdateWeatherInput } from "./weather.dto";
import { Weather } from "./weather.entity";

@Injectable()
export class WeathersService {
  constructor(
    @InjectRepository(Weather)
    private weatherRepository: Repository<Weather>,
  ) {}

  create(createWeatherInput: CreateWeatherInput) {
    return this.weatherRepository.save(createWeatherInput);
  }

  findAll() {
    return this.weatherRepository.find();
  }

  update(id: number, updateWeatherInput: UpdateWeatherInput) {
    return this.weatherRepository.save({
      id,
      ...updateWeatherInput,
    });
  }

  remove(id: number) {
    return this.weatherRepository.delete({ id });
  }
}
