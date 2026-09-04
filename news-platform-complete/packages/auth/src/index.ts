import { createHash, randomBytes } from "node:crypto";
export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
};

export type Permission =
  | "article:create"
  | "article:edit"
  | "article:publish"
  | "article:schedule"
  | "article:archive"
  | "media:manage"
  | "users:manage"
  | "comments:moderate"
  | "analytics:view"
  | "settings:manage";

export interface AuthService {
  getSession(request: Request): Promise<AuthenticatedUser | null>;
  requirePermission(userId: string, permission: Permission): Promise<void>;
}

export const SESSION_COOKIE = "news_session";
export const createSessionToken = () => randomBytes(32).toString("base64url");
export const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");
