import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { ScheduleModule } from "@nestjs/schedule";
import { ApisModule } from "./apis/apis.module";
import { UtilsModule } from "./utils/utils.module";
import { CitiesModule } from "./cities/cities.module";
import { WeathersModule } from "./weathers/weathers.module";
import { AirPollutionsModule } from "./air-pollutions/air-pollutions.module";
import { ForecastsModule } from "./forecasts/forecasts.module";
import { ClimatesModule } from "./climates/climates.module";
import { TasksModule } from "./tasks/tasks.module";
import { AirForecastsModule } from './air-forecasts/air-forecasts.module';

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
    }),
    ScheduleModule.forRoot(),
    ApisModule,
    UtilsModule,
    CitiesModule,
    WeathersModule,
    AirPollutionsModule,
    ForecastsModule,
    ClimatesModule,
    TasksModule,
    AirForecastsModule,
  ],
})
export class AppModule {}
