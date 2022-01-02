import { IsNotEmpty, IsDateString, IsNumber, IsObject } from "class-validator";
import { City } from "src/cities/city.entity";

export class CreateAirPollutionDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  pm10: number;

  @IsNotEmpty()
  @IsNumber()
  pm25: number;
}

export class CreateAirPollutionWithCityDto extends CreateAirPollutionDto {
  @IsNotEmpty()
  @IsObject()
  city: City;
}
