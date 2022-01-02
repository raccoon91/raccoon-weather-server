import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, ValueTransformer } from "typeorm";
import { City } from "src/cities/city.entity";
import dayjs from "dayjs";

const transformer: ValueTransformer = {
  from: (value) => dayjs(value).add(9, "hour").toISOString(),
  to: (value) => value,
};

@Entity()
@Unique(["date", "city.id"])
export class AirPollution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamptz", transformer })
  date: string;

  @Column({ type: "real", default: 0 })
  pm10: number;

  @Column({ type: "real", default: 0 })
  pm25: number;

  @ManyToOne(() => City, (city) => city.weathers, { eager: false })
  city: City;
}
