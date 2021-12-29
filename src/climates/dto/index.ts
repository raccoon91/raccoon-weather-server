import { IsNotEmpty, IsNumber, IsDateString, IsObject } from "class-validator";
import { City } from "src/cities/city.entity";

export class CreateClimateDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  temp: number;

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

export class CreateClimateWithCityDto extends CreateClimateDto {
  @IsNotEmpty()
  @IsObject()
  city: City;
}
