import { IsNotEmpty, IsInt, IsString, IsOptional } from "class-validator";

export class CreateCityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  stn: number;

  @IsNotEmpty()
  @IsInt()
  nx: number;

  @IsNotEmpty()
  @IsInt()
  ny: number;
}

export class UpdateCityDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  stn: number;

  @IsOptional()
  @IsInt()
  nx: number;

  @IsOptional()
  @IsInt()
  ny: number;
}
