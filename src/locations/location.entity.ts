import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Weather } from "src/weathers/weather.entity";

@Entity()
@ObjectType()
export class Location {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field()
  countryCode: string;

  @Column({ unique: true })
  @Field()
  city: string;

  @OneToMany(() => Weather, (weather) => weather.location)
  @Field(() => [Weather], { nullable: true })
  weathers?: Weather[];
}
