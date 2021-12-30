import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, ValueTransformer } from "typeorm";
import { City } from "src/cities/city.entity";
import dayjs from "dayjs";

const transformer: ValueTransformer = {
  from: (value) => dayjs(value).add(9, "hour").toISOString(),
  to: (value) => value,
};

@Entity()
@Unique(["date", "city.id"])
export class Forecast {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamptz", transformer })
  date: string;

  @Column({ type: "smallint" })
  sky: number;

  @Column({ type: "real" })
  temp: number;

  @Column({ type: "real" })
  rain: number;

  @Column({ type: "smallint" })
  rainType: number;

  @Column({ type: "smallint" })
  rainProb: number;

  @Column({ type: "real" })
  humid: number;

  @Column({ type: "real" })
  wind: number;

  @Column({ type: "smallint" })
  windDirection: number;

  @ManyToOne(() => City, (city) => city.forecasts, { eager: false })
  city: City;
}
