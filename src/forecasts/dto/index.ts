import { IsNotEmpty, IsDateString, IsNumber, IsObject } from "class-validator";
import { City } from "src/cities/city.entity";

export class CreateForecastDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  sky: number;

  @IsNotEmpty()
  @IsNumber()
  temp: number;

  @IsNotEmpty()
  @IsNumber()
  rain: number;

  @IsNotEmpty()
  @IsNumber()
  rainType: number;

  @IsNotEmpty()
  @IsNumber()
  rainProb: number;

  @IsNotEmpty()
  @IsNumber()
  humid: number;

  @IsNotEmpty()
  @IsNumber()
  wind: number;

  @IsNotEmpty()
  @IsNumber()
  windDirection: number;
}

export class CreateForecastWithCityDto extends CreateForecastDto {
  @IsNotEmpty()
  @IsObject()
  city: City;
}
