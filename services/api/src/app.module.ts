import { Controller, Get, Module } from "@nestjs/common";
import { AuthController } from "./auth/auth.controller";
import { AuthServiceImpl } from "./auth/auth.service";
import { ArticlesController } from "./articles/articles.controller";
import { ArticlesService } from "./articles/articles.service";
import { PublicController } from "./public.controller";
import { GlobalController } from "./global.controller";

@Controller()
class HealthController {
  @Get("/health") health() { return { status: "ok", service: "news-api" }; }
  @Get("/ready") ready() { return { status: "ready" }; }
}

@Module({ controllers: [HealthController, AuthController, ArticlesController, PublicController, GlobalController], providers: [AuthServiceImpl, ArticlesService] })
export class AppModule {}
