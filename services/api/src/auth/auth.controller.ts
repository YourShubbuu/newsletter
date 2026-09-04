import { Body, ConflictException, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import type { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { db, schema } from "@news/db";
import { createSessionToken, hashSessionToken, SESSION_COOKIE } from "@news/auth";
import { AuthServiceImpl } from "./auth.service";

const scrypt = promisify(scryptCallback);
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

async function verifyPassword(password: string, encoded: string) {
  const [, salt, expectedHex] = encoded.split("$");
  if (!salt || !expectedHex) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function setSession(response: Response, token: string) {
  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MS,
    path: "/",
  });
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthServiceImpl) {}

  @Post("signup")
  async signup(@Body() body: { email?: string; password?: string; displayName?: string }, @Res({ passthrough: true }) response: Response) {
    const email = body.email?.trim().toLowerCase();
    const displayName = body.displayName?.trim();
    const password = body.password ?? "";
    if (!email || !displayName || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      throw new UnauthorizedException("Use a valid email and a password of at least 8 characters");
    }
    const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
    if (existing.length) throw new ConflictException("An account with that email already exists");

    const passwordHash = await hashPassword(password);
    const rows = await db.execute(sql`INSERT INTO users (email, display_name, password_hash) VALUES (${email}, ${displayName}, ${passwordHash}) RETURNING id, email, display_name`);
    const user = (rows as any[])[0];
    if (!user) throw new UnauthorizedException("Unable to create account");
    const token = createSessionToken();
    await db.insert(schema.sessions).values({ userId: user.id, tokenHash: hashSessionToken(token), expiresAt: new Date(Date.now() + SESSION_MS) });
    setSession(response, token);
    return { user: { id: user.id, email: user.email, displayName: user.display_name } };
  }

  @Post("login")
  async login(@Body() body: { email?: string; password?: string }, @Res({ passthrough: true }) response: Response) {
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !password) throw new UnauthorizedException("Email and password are required");
    const rows = await db.execute(sql`SELECT id, email, display_name, password_hash FROM users WHERE lower(email) = ${email} LIMIT 1`);
    const user = (rows as any[])[0];
    if (!user?.password_hash || !(await verifyPassword(password, user.password_hash))) throw new UnauthorizedException("Invalid email or password");
    const token = createSessionToken();
    await db.insert(schema.sessions).values({ userId: user.id, tokenHash: hashSessionToken(token), expiresAt: new Date(Date.now() + SESSION_MS) });
    setSession(response, token);
    return { user: { id: user.id, email: user.email, displayName: user.display_name } };
  }

  @Post("dev-session")
  async devSession(@Body() body: { email?: string }, @Res({ passthrough: true }) response: Response) {
    if (process.env.ALLOW_DEV_AUTH !== "true") throw new UnauthorizedException("Development authentication is disabled");
    if (!body.email) throw new UnauthorizedException("Email is required");
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, body.email)).limit(1);
    if (!user) throw new UnauthorizedException("Seeded user not found");
    const token = createSessionToken();
    await db.insert(schema.sessions).values({ userId: user.id, tokenHash: hashSessionToken(token), expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) });
    setSession(response, token);
    return { user: { id: user.id, email: user.email, displayName: user.displayName } };
  }

  @Post("logout")
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = request.cookies?.[SESSION_COOKIE];
    if (token) await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, hashSessionToken(token)));
    response.clearCookie(SESSION_COOKIE, { path: "/", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", secure: process.env.NODE_ENV === "production" });
    return { ok: true };
  }

  @Get("me")
  async me(@Req() request: Request) {
    const user = await this.auth.requireUser(request.cookies?.[SESSION_COOKIE]);
    return { user };
  }
}
