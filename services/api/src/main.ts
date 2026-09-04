import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { RequestMethod } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const webOrigin = process.env.WEB_ORIGIN;
  if (process.env.NODE_ENV === "production" && !webOrigin) {
    throw new Error("WEB_ORIGIN must be configured in production");
  }

  app.enableCors({
    origin: webOrigin ?? "http://localhost:3000",
    credentials: true,
  });

  app.setGlobalPrefix("api", {
    exclude: [
      { path: "health", method: RequestMethod.GET },
      { path: "ready", method: RequestMethod.GET },
    ],
  });

  await app.listen(Number(process.env.PORT ?? 4000), "0.0.0.0");
}

bootstrap();
