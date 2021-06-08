import { InputType, Field, PartialType, Int, Float, ObjectType, GraphQLISODateTime } from "@nestjs/graphql";

@InputType()
export class CreateLocationInput {
  @Field()
  countryCode: string;

  @Field()
  city: string;

  @Field()
  stnId: string;
}

@InputType()
export class UpdateLocationInput extends PartialType(CreateLocationInput) {
  @Field(() => Int)
  id: number;
}

@ObjectType()
class Temp {
  @Field(() => GraphQLISODateTime)
  date: Date;

  @Field(() => Float)
  temp: number;
}

@ObjectType()
class Rain {
  @Field(() => GraphQLISODateTime)
  date: Date;

  @Field(() => Float, { nullable: true })
  rain: number | null;
}

@ObjectType()
class Humid {
  @Field(() => GraphQLISODateTime)
  date: Date;

  @Field(() => Float, { nullable: true })
  humid: number | null;
}

@ObjectType()
export class LocationOutput {
  @Field()
  countryCode: string;

  @Field()
  city: string;

  @Field()
  stnId: string;

  @Field(() => Int)
  length: number;

  @Field(() => [Temp])
  tempData: [Temp];

  @Field(() => [Rain])
  rainData: [Rain];

  @Field(() => [Humid])
  humidData: [Humid];
}
