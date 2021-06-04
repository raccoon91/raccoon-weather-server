import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { LocationsService } from "./locations.service";
import { Location } from "./location.entity";
import { CreateLocationInput, UpdateLocationInput } from "./location.dto";

@Resolver(() => Location)
export class LocationsResolver {
  constructor(private readonly locationsService: LocationsService) {}

  @Mutation(() => Location)
  createLocation(@Args("createLocationInput") createLocationInput: CreateLocationInput) {
    return this.locationsService.create(createLocationInput);
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
