import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { LocationsService } from "./locations.service";
import { Location } from "./location.entity";
import { CreateLocationInput, UpdateLocationInput } from "./location.dto";
import { Weather } from "src/weathers/weather.entity";

@Resolver(() => Location)
export class LocationsResolver {
  constructor(private readonly locationsService: LocationsService) {}

  @Mutation(() => Location)
  createLocation(
    @Args("createLocationInput") createLocationInput: CreateLocationInput,
  ) {
    return this.locationsService.create(createLocationInput);
  }

  @Query(() => [Location], { name: "locations" })
  findAll() {
    return this.locationsService.findAll();
  }

  @Query(() => Location, { name: "location" })
  findOne(@Args("name", { type: () => String }) name: string) {
    return this.locationsService.findOne(name);
  }

  @Mutation(() => Location)
  updateLocation(
    @Args("updateLocationInput") updateLocationInput: UpdateLocationInput,
  ) {
    return this.locationsService.update(
      updateLocationInput.name,
      updateLocationInput,
    );
  }

  @Mutation(() => Location)
  removeLocation(@Args("name", { type: () => String }) name: string) {
    return this.locationsService.remove(name);
  }
}
