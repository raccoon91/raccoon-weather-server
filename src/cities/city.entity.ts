import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Weather } from "src/weathers/weather.entity";
import { Forecast } from "src/forecasts/forecast.entity";
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

  @OneToMany(() => Weather, (weather) => weather.city, { eager: false })
  weathers: Weather[];

  @OneToMany(() => Forecast, (forecast) => forecast.city, { eager: false })
  forecasts: Forecast[];

  @OneToMany(() => Climate, (climate) => climate.city, { eager: false })
  climates: Climate[];
}
