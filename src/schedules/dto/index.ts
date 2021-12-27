import { IsNotEmpty, IsInt } from "class-validator";

export class CreateDailyWeatherDto {
  @IsNotEmpty()
  @IsInt()
  year: number;

  @IsNotEmpty()
  @IsInt()
  month: number;
}
