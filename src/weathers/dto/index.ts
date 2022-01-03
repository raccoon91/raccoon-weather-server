import { IsNotEmpty, IsDateString, IsNumber, IsObject } from "class-validator";
import { City } from "src/cities/city.entity";

export class CreateWeatherWithCityDto {
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
  rain: number;

  @IsNotEmpty()
  @IsNumber()
  rainType: number;

  @IsNotEmpty()
  @IsNumber()
  humid: number;

  @IsNotEmpty()
  @IsNumber()
  wind: number;

  @IsNotEmpty()
  @IsNumber()
  windDirection: number;

  @IsNotEmpty()
  @IsNumber()
  pm10: number;

  @IsNotEmpty()
  @IsNumber()
  pm25: number;
}
