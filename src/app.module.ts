import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
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
import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env" }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        type: "postgres",
        host: config.get("DB_HOST"),
        port: parseInt(config.get("DB_PORT")),
        username: config.get("DB_USERNAME"),
        password: config.get("DB_PASSWORD"),
        database: config.get("DB_DATABASE"),
        entities: [__dirname + "/**/*.entity.{js,ts}"],
        synchronize: config.get("DB_SYNC") === "true",
        namingStrategy: new SnakeNamingStrategy(),
        useUTC: false,
      }),
      inject: [ConfigService],
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
  controllers: [AppController],
})
export class AppModule {}
