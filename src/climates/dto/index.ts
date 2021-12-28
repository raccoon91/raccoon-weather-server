import { IsNotEmpty, IsInt, IsDateString, IsObject } from "class-validator";
import { City } from "src/cities/city.entity";

export class CreateClimateDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsInt()
  @IsNotEmpty()
  @IsInt()
  temp: number;

  @IsNotEmpty()
  @IsInt()
  minTemp: number;

  @IsNotEmpty()
  @IsInt()
  maxTemp: number;

  @IsNotEmpty()
  @IsInt()
  rain: number;

  @IsNotEmpty()
  @IsInt()
  wind: number;

  @IsNotEmpty()
  @IsInt()
  humid: number;
}

export class CreateClimateWithCityDto extends CreateClimateDto {
  @IsNotEmpty()
  @IsObject()
  city: City;
}
