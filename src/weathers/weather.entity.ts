import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from "typeorm";
import { City } from "src/cities/city.entity";

@Entity()
@Unique(["date", "city.id"])
export class Weather {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamp" })
  date: string;

  @Column({ type: "real" })
  temp: number;

  @Column({ type: "real" })
  rain: number;

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
