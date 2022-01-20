import { IsNotEmpty, IsDateString, IsNumber, IsObject } from "class-validator";
import { City } from "src/cities/city.entity";

export class CreateCovidWithCityDto {
  @IsNotEmpty()
  @IsObject()
  city: City;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  case: number;

  @IsNotEmpty()
  @IsNumber()
  caseIncrement: number;
}
