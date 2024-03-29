import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from "typeorm";
import { City } from "src/cities/city.entity";

@Entity()
@Unique(["date", "city.id"])
export class Forecast {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamp" })
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

  @Column({ type: "smallint", nullable: true })
  pm10Grade: number;

  @Column({ type: "smallint", nullable: true })
  pm25Grade: number;

  @ManyToOne(() => City, (city) => city.forecasts, { eager: false })
  city: City;
}
