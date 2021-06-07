import { Module, HttpModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { WeathersService } from "./weathers.service";
import { WeathersResolver } from "./weathers.resolver";
import { Weather } from "./weather.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Weather]),
    HttpModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get("OPEN_API_WEATHER_HOUR_URL"),
        params: {
          serviceKey: configService.get("OPEN_API_SECRET_KEY"),
          dataType: "JSON",
          dataCd: "ASOS",
          dateCd: "HR",
          numOfRows: "900",
          startHh: "00",
          endHh: "23",
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [WeathersResolver, WeathersService],
  exports: [WeathersService],
})
export class WeathersModule {}
