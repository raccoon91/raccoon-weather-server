import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as providers from "./providers";

@Global()
@Module({
  imports: [ConfigModule],
  providers: Object.values(providers),
  exports: Object.values(providers),
})
export class CommonModule {}
