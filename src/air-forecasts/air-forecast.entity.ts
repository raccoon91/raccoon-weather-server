import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, ValueTransformer } from "typeorm";
import { City } from "src/cities/city.entity";
import dayjs from "dayjs";

const transformer: ValueTransformer = {
  from: (value) => dayjs(value).add(9, "hour").toISOString(),
  to: (value) => value,
};

@Entity()
@Unique(["date", "city.id"])
export class AirForecast {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamptz", transformer })
  date: string;

  @Column({ type: "smallint" })
  pm10Grade: number;

  @Column({ type: "smallint" })
  pm25Grade: number;

  @ManyToOne(() => City, (city) => city.airForecasts, { eager: false })
  city: City;
}
