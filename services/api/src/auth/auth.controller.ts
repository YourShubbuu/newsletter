import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import type { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@news/db";
import { createSessionToken, hashSessionToken, SESSION_COOKIE } from "@news/auth";
import { AuthServiceImpl } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthServiceImpl) {}

  @Post("dev-session")
  async devSession(@Body() body: { email?: string }, @Res({ passthrough: true }) response: Response) {
    if (process.env.ALLOW_DEV_AUTH !== "true") throw new UnauthorizedException("Development authentication is disabled");
    if (!body.email) throw new UnauthorizedException("Email is required");
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, body.email)).limit(1);
    if (!user) throw new UnauthorizedException("Seeded user not found");
    const token = createSessionToken();
    await db.insert(schema.sessions).values({ userId: user.id, tokenHash: hashSessionToken(token), expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) });
    response.cookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 8 * 60 * 60 * 1000, path: "/" });
    return { user: { id: user.id, email: user.email, displayName: user.displayName } };
  }

  @Post("logout")
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = request.cookies?.[SESSION_COOKIE];
    if (token) await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, hashSessionToken(token)));
    response.clearCookie(SESSION_COOKIE, { path: "/" });
    return { ok: true };
  }

  @Get("me")
  async me(@Req() request: Request) {
    const user = await this.auth.requireUser(request.cookies?.[SESSION_COOKIE]);
    return { user };
  }
}
