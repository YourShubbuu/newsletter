import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { and, eq, gt } from "drizzle-orm";
import { db, schema } from "@news/db";
import { hashSessionToken } from "@news/auth";
import type { Permission } from "@news/auth";

const permissionByRole: Record<string, Permission[]> = {
  reporter: ["article:create", "article:edit"],
  editor: ["article:create", "article:edit", "article:schedule"],
  managing_editor: ["article:create", "article:edit", "article:publish", "article:schedule", "article:archive", "media:manage", "comments:moderate", "analytics:view"],
  admin: ["article:create", "article:edit", "article:publish", "article:schedule", "article:archive", "media:manage", "users:manage", "comments:moderate", "analytics:view", "settings:manage"],
};

@Injectable()
export class AuthServiceImpl {
  async getUserFromToken(token: string) {
    const [row] = await db
      .select({ user: schema.users, session: schema.sessions })
      .from(schema.sessions)
      .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
      .where(and(eq(schema.sessions.tokenHash, hashSessionToken(token)), gt(schema.sessions.expiresAt, new Date())))
      .limit(1);
    if (!row) return null;
    await db.update(schema.sessions).set({ lastSeenAt: new Date() }).where(eq(schema.sessions.id, row.session.id));
    return row.user;
  }

  async requirePermission(userId: string, permission: Permission) {
    const rows = await db
      .select({ role: schema.roles.name })
      .from(schema.userRoles)
      .innerJoin(schema.roles, eq(schema.roles.id, schema.userRoles.roleId))
      .where(eq(schema.userRoles.userId, userId));
    const allowed = rows.some(({ role }) => (permissionByRole[role] ?? []).includes(permission));
    if (!allowed) throw new ForbiddenException(`Missing permission: ${permission}`);
  }

  async requireUser(token?: string) {
    if (!token) throw new UnauthorizedException("Authentication required");
    const user = await this.getUserFromToken(token);
    if (!user) throw new UnauthorizedException("Invalid or expired session");
    return user;
  }
}
