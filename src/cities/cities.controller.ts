import { Controller, Body, Param, Get, Post, Patch, Delete, ParseIntPipe, ValidationPipe } from "@nestjs/common";
import { CreateCityDto, UpdateCityDto } from "./dto";
import { CitiesService } from "./cities.service";

@Controller("cities")
export class CitiesController {
  constructor(private citiesService: CitiesService) {}

  @Get()
  getCities() {
    return this.citiesService.getCities();
  }

  @Get("/:id")
  getCity(@Param("id", ParseIntPipe) id: number) {
    return this.citiesService.getCity(id);
  }

  @Post()
  createCities(@Body(ValidationPipe) createCityDto: CreateCityDto[]) {
    return this.citiesService.createCities(createCityDto);
  }

  @Patch("/:id")
  updateCity(@Param("id", ParseIntPipe) id: number, @Body(ValidationPipe) updateCityDto: UpdateCityDto) {
    return this.citiesService.updateCity(id, updateCityDto);
  }

  @Delete("/:id")
  deleteCity(@Param("id", ParseIntPipe) id: number) {
    return this.citiesService.deleteCity(id);
  }
}
