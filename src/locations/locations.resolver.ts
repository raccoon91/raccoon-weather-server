import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { LocationsService } from "./locations.service";
import { Location } from "./location.entity";
import { CreateLocationInput, UpdateLocationInput } from "./location.dto";
import { WeathersService } from "src/weathers/weathers.service";

@Resolver(() => Location)
export class LocationsResolver {
  constructor(private readonly locationsService: LocationsService, private readonly weathersService: WeathersService) {}

  @Mutation(() => Location)
  async createLocation(@Args("createLocationInput") createLocationInput: CreateLocationInput) {
    const location = await this.locationsService.create(createLocationInput);

    await this.weathersService.createLocationWeathers(location);

    return location;
  }

  @Query(() => [Location], { name: "locations" })
  findAll() {
    return this.locationsService.findAll();
  }

  @Query(() => Location, { name: "location" })
  findOne(@Args("city", { type: () => String }) city: string) {
    return this.locationsService.findOne(city);
  }

  @Mutation(() => Location)
  updateLocation(@Args("updateLocationInput") updateLocationInput: UpdateLocationInput) {
    return this.locationsService.update(updateLocationInput.city, updateLocationInput);
  }

  @Mutation(() => Location)
  removeLocation(@Args("city", { type: () => String }) city: string) {
    return this.locationsService.remove(city);
  }
}
