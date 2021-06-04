import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class CreateWeatherInput {
  @Field(() => Int)
  temp: number;

  @Field()
  locationName: string;
}

@InputType()
export class UpdateWeatherInput extends PartialType(CreateWeatherInput) {
  @Field(() => Int)
  id: number;
}
