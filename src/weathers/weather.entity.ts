import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Location } from "src/locations/location.entity";

@Entity()
@ObjectType()
export class Weather {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => Int)
  temp: number;

  @Column()
  @Field()
  city: string;

  @ManyToOne(() => Location, (location) => location.weathers)
  @JoinColumn({ name: "city", referencedColumnName: "city" })
  @Field(() => Location)
  location: Location;
}
