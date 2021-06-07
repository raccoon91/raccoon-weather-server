import { ObjectType, Field, Int, Float, GraphQLISODateTime } from "@nestjs/graphql";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Location } from "src/locations/location.entity";

@Entity()
@ObjectType()
export class Weather {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field()
  city: string;

  @Column()
  @Field(() => Float)
  temp: number;

  @Column({ nullable: true })
  @Field(() => Float, { nullable: true })
  rain: number | null;

  @Column({ nullable: true })
  @Field(() => Float, { nullable: true })
  humid: number | null;

  @Column()
  @Field(() => GraphQLISODateTime)
  date: Date;

  @ManyToOne(() => Location, (location) => location.weathers)
  @JoinColumn({ name: "city", referencedColumnName: "city" })
  @Field(() => Location)
  location: Location;
}
