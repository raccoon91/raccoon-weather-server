import { IsNotEmpty, IsOptional, IsDateString, IsNumber, IsObject } from "class-validator";
import { City } from "src/cities/city.entity";

export class CreateForecastWithCityDto {
  @IsNotEmpty()
  @IsObject()
  city: City;

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

  @IsOptional()
  @IsNumber()
  pm10Grade: number;

  @IsOptional()
  @IsNumber()
  pm25Grade: number;
}

export class UpdateForecastAirWithCityDto {
  @IsNotEmpty()
  @IsObject()
  city: City;

  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @IsNotEmpty()
  @IsDateString()
  toDate: string;

  @IsOptional()
  @IsNumber()
  pm10Grade: number;

  @IsOptional()
  @IsNumber()
  pm25Grade: number;
}
