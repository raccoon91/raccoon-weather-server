import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UtilsModule } from "src/utils/utils.module";
import { ApisService } from "./apis.service";

@Module({
  imports: [ConfigModule, UtilsModule],
  providers: [ApisService],
  exports: [ApisService],
})
export class ApisModule {}
