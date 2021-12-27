import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  stn: number;

  @Column()
  nx: number;

  @Column()
  ny: number;
}
