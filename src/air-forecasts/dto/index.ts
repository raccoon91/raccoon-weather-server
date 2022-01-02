import { IsNotEmpty, IsDateString, IsNumber, IsObject } from "class-validator";
import { City } from "src/cities/city.entity";

export class CreateAirForecastDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  pm10Grade: number;

  @IsNotEmpty()
  @IsNumber()
  pm25Grade: number;
}

export class CreateAirForecastWithCityDto extends CreateAirForecastDto {
  @IsNotEmpty()
  @IsObject()
  city: City;
}
