import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, ValueTransformer } from "typeorm";
import { City } from "src/cities/city.entity";
import dayjs from "dayjs";

const transformer: ValueTransformer = {
  from: (value) => dayjs(value).add(9, "hour").toISOString(),
  to: (value) => value,
};
@Entity()
@Unique(["date", "city.id"])
export class Weather {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamptz", transformer })
  date: string;

  @Column({ type: "real" })
  temp: number;

  @Column({ type: "real" })
  rain: number;

  @Column({ type: "smallint" })
  rainType: number;

  @Column({ type: "real" })
  humid: number;

  @Column({ type: "real" })
  wind: number;

  @Column({ type: "smallint" })
  windDirection: number;

  @Column({ type: "real" })
  pm10: number;

  @Column({ type: "real" })
  pm25: number;

  @ManyToOne(() => City, (city) => city.weathers, { eager: false })
  city: City;
}
