import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const port = parseInt(process.env.PORT);

  const app = await NestFactory.create(AppModule);
  await app.listen(port);

  Logger.log(`server start on port ${port}`);
}

bootstrap();
