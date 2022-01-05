import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from "typeorm";
import { City } from "src/cities/city.entity";

@Entity()
@Unique(["date", "city.id"])
export class Climate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date: string;

  @Column({ type: "real" })
  temp: number;

  @Column({ type: "real" })
  feel: number;

  @Column({ type: "real" })
  minTemp: number;

  @Column({ type: "real" })
  maxTemp: number;

  @Column({ type: "real" })
  rain: number;

  @Column({ type: "real" })
  wind: number;

  @Column({ type: "real" })
  humid: number;

  @ManyToOne(() => City, (city) => city.climates, { eager: false })
  city: City;
}
