import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from "typeorm";
import { City } from "src/cities/city.entity";

@Entity()
@Unique(["date", "city.id"])
export class Covid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamp" })
  date: string;

  @Column({ type: "int" })
  case: number;

  @Column({ type: "int" })
  caseIncrement: number;

  @ManyToOne(() => City, (city) => city.weathers, { eager: false })
  city: City;
}
