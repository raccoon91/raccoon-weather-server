import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const whitelist = ["https://weather.dev-raccoon.com", "http://localhost:3000"];
  const port = parseInt(process.env.PORT);

  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: process.env.NODE_ENV === "development" ? "*" : whitelist });

  await app.listen(port);
}

bootstrap();
