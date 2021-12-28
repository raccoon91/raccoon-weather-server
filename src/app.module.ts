import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CitiesModule } from "./cities/cities.module";
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
    }),
    CitiesModule,
    ClimatesModule,
    TasksModule,
  ],
})
export class AppModule {}
