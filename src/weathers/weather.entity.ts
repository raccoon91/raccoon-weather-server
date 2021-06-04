import { ObjectType, Field, Int } from "@nestjs/graphql";
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
  JoinColumn,
} from "typeorm";
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
  locationName: string;

  @ManyToOne(() => Location, (location) => location.weathers)
  @JoinColumn({ name: "locationName", referencedColumnName: "name" })
  @Field(() => Location)
  location: Location;
}
