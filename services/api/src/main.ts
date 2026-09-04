import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000", credentials: true });
  app.setGlobalPrefix("api");
  await app.listen(Number(process.env.PORT ?? 4000), "0.0.0.0");
}
bootstrap();
