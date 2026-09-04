import { Controller, Get, Module } from "@nestjs/common";
import { AuthController } from "./auth/auth.controller";
import { AuthServiceImpl } from "./auth/auth.service";
import { ArticlesController } from "./articles/articles.controller";
import { ArticlesService } from "./articles/articles.service";

@Controller()
class HealthController {
  @Get("/health") health() { return { status: "ok", service: "news-api" }; }
  @Get("/ready") ready() { return { status: "ready" }; }
}

@Module({ controllers: [HealthController, AuthController, ArticlesController], providers: [AuthServiceImpl, ArticlesService] })
export class AppModule {}
