import { IsNotEmpty, IsNumber, IsDateString, IsObject } from "class-validator";
import { City } from "src/cities/city.entity";

export class CreateClimateWithCityDto {
  @IsNotEmpty()
  @IsObject()
  city: City;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  temp: number;

  @IsNotEmpty()
  @IsNumber()
  feel: number;

  @IsNotEmpty()
  @IsNumber()
  minTemp: number;

  @IsNotEmpty()
  @IsNumber()
  maxTemp: number;

  @IsNotEmpty()
  @IsNumber()
  rain: number;

  @IsNotEmpty()
  @IsNumber()
  wind: number;

  @IsNotEmpty()
  @IsNumber()
  humid: number;
}

export class CreateClimatesByYearDto {
  @IsNotEmpty()
  @IsNumber()
  startYear: number;

  @IsNotEmpty()
  @IsNumber()
  endYear: number;
}
