import { InputType, Field, PartialType, Int } from "@nestjs/graphql";

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
