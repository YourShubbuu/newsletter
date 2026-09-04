ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_lower_idx" ON "users" USING btree (lower("email"));
