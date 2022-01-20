import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { ScheduleModule } from "@nestjs/schedule";
import { CommonModule } from "./common/common.module";
import { CitiesModule } from "./cities/cities.module";
import { WeathersModule } from "./weathers/weathers.module";
import { ForecastsModule } from "./forecasts/forecasts.module";
import { CovidsModule } from "./covids/covids.module";
import { ClimatesModule } from "./climates/climates.module";
import { TasksModule } from "./tasks/tasks.module";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env" }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOSTNAME,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + "/**/*.entity.{js,ts}"],
      synchronize: process.env.DB_SYNC === "true",
      namingStrategy: new SnakeNamingStrategy(),
      useUTC: false,
    }),
    ScheduleModule.forRoot(),
    CommonModule,
    CitiesModule,
    WeathersModule,
    ForecastsModule,
    CovidsModule,
    ClimatesModule,
    TasksModule,
  ],
})
export class AppModule {}
