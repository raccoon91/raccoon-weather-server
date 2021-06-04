import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LocationsService } from "./locations.service";
import { LocationsResolver } from "./locations.resolver";
import { Location } from "./location.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  providers: [LocationsResolver, LocationsService],
})
export class LocationsModule {}
