import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LocationsService } from "./locations.service";
import { LocationsResolver } from "./locations.resolver";
import { Location } from "./location.entity";
import { WeathersModule } from "src/weathers/weathers.module";

@Module({
  imports: [TypeOrmModule.forFeature([Location]), WeathersModule],
  providers: [LocationsResolver, LocationsService],
})
export class LocationsModule {}
