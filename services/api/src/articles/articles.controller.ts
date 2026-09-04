import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { SESSION_COOKIE } from "@news/auth";
import { AuthServiceImpl } from "../auth/auth.service";
import { ArticlesService } from "./articles.service";

@Controller("articles")
export class ArticlesController {
  constructor(private readonly articles: ArticlesService, private readonly auth: AuthServiceImpl) {}

  private async actor(request: Request, permission: "article:create" | "article:edit" | "article:publish") {
    const user = await this.auth.requireUser(request.cookies?.[SESSION_COOKIE]);
    await this.auth.requirePermission(user.id, permission);
    return user;
  }

  @Get()
  async list(@Req() request: Request) { await this.actor(request, "article:edit"); return this.articles.list(); }
  @Get(":id")
  async get(@Req() request: Request, @Param("id") id: string) { await this.actor(request, "article:edit"); return this.articles.get(id); }
  @Post()
  async create(@Req() request: Request, @Body() body: any) { const user = await this.actor(request, "article:create"); return this.articles.create(body, user.id); }
  @Patch(":id")
  async update(@Req() request: Request, @Param("id") id: string, @Body() body: any) { const user = await this.actor(request, "article:edit"); return this.articles.update(id, body, user.id); }
  @Post(":id/transition")
  async transition(@Req() request: Request, @Param("id") id: string, @Body() body: { to: string }) { const user = await this.actor(request, "article:publish"); return this.articles.transition(id, body.to, user.id); }
}
