import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { WeathersService } from "./weathers.service";
import { Weather } from "./weather.entity";
import { CreateWeatherInput, UpdateWeatherInput } from "./weather.dto";

@Resolver(() => Weather)
export class WeathersResolver {
  constructor(private readonly weathersService: WeathersService) {}

  @Mutation(() => Weather)
  createWeather(
    @Args("createWeatherInput") createWeatherInput: CreateWeatherInput,
  ) {
    return this.weathersService.create(createWeatherInput);
  }

  @Query(() => [Weather], { name: "weathers" })
  findAll() {
    return this.weathersService.findAll();
  }

  @Mutation(() => Weather)
  updateWeather(
    @Args("updateWeatherInput") updateWeatherInput: UpdateWeatherInput,
  ) {
    return this.weathersService.update(
      updateWeatherInput.id,
      updateWeatherInput,
    );
  }

  @Mutation(() => Weather)
  removeWeather(@Args("id", { type: () => Int }) id: number) {
    return this.weathersService.remove(id);
  }
}
