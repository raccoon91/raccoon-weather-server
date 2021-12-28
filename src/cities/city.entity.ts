import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Climate } from "src/climates/climate.entity";

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: "smallint" })
  stn: number;

  @Column({ type: "smallint" })
  nx: number;

  @Column({ type: "smallint" })
  ny: number;

  @OneToMany(() => Climate, (climate) => climate.city, { eager: false })
  climates: Climate[];
}
