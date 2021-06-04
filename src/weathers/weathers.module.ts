import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WeathersService } from "./weathers.service";
import { WeathersResolver } from "./weathers.resolver";
import { Weather } from "./weather.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Weather])],
  providers: [WeathersResolver, WeathersService],
})
export class WeathersModule {}
