import { InputType, Field, Float, Int, GraphQLISODateTime, PartialType } from "@nestjs/graphql";

@InputType()
export class CreateWeatherInput {
  @Field()
  city: string;

  @Field(() => Float)
  temp: number;

  @Field(() => Float, { nullable: true })
  rain: number | null;

  @Field(() => Float, { nullable: true })
  humid: number | null;

  @Field(() => GraphQLISODateTime)
  date: Date;
}

@InputType()
export class UpdateWeatherInput extends PartialType(CreateWeatherInput) {
  @Field(() => Int)
  id: number;
}
