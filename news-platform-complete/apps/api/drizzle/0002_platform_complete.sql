ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "published_at" timestamptz;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "scheduled_at" timestamptz;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "preview_token" varchar(96);
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "seo_title" varchar(180);
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "seo_description" varchar(320);
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "canonical_url" text;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "og_image_url" text;
CREATE UNIQUE INDEX IF NOT EXISTS "articles_preview_token_idx" ON "articles" ("preview_token");
CREATE TABLE IF NOT EXISTS "media_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "filename" text NOT NULL,
  "mime_type" varchar(160) NOT NULL,
  "byte_size" bigint NOT NULL DEFAULT 0,
  "width" integer, "height" integer,
  "alt_text" text NOT NULL DEFAULT '', "caption" text NOT NULL DEFAULT '',
  "credit" text NOT NULL DEFAULT '', "storage_key" text NOT NULL UNIQUE,
  "public_url" text, "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "article_media" (
  "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "media_id" uuid NOT NULL REFERENCES "media_assets"("id") ON DELETE CASCADE,
  "role" varchar(40) NOT NULL DEFAULT 'inline',
  PRIMARY KEY ("article_id","media_id","role")
);
CREATE TABLE IF NOT EXISTS "article_corrections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "summary" text NOT NULL, "details" text NOT NULL,
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "scheduled_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "run_at" timestamptz NOT NULL, "status" varchar(24) NOT NULL DEFAULT 'pending',
  "attempts" integer NOT NULL DEFAULT 0, "last_error" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "scheduled_jobs_due_idx" ON "scheduled_jobs" ("status","run_at");
CREATE TABLE IF NOT EXISTS "analytics_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_name" varchar(100) NOT NULL,
  "article_id" uuid REFERENCES "articles"("id") ON DELETE SET NULL,
  "session_id" uuid, "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "path" text, "referrer" text, "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "analytics_events_article_idx" ON "analytics_events" ("article_id","created_at");
CREATE TABLE IF NOT EXISTS "newsletter_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(320) NOT NULL UNIQUE, "status" varchar(24) NOT NULL DEFAULT 'pending',
  "token" varchar(96) NOT NULL UNIQUE, "created_at" timestamptz NOT NULL DEFAULT now(),
  "confirmed_at" timestamptz
);
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" varchar(80) NOT NULL, "title" varchar(200) NOT NULL, "body" text NOT NULL,
  "href" text, "read_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "notifications" ("user_id","created_at" DESC);
CREATE TABLE IF NOT EXISTS "comment_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "comment_id" uuid NOT NULL REFERENCES "comments"("id") ON DELETE CASCADE,
  "reason" varchar(120) NOT NULL, "status" varchar(24) NOT NULL DEFAULT 'open',
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "articles_published_at_idx" ON "articles" ("published_at" DESC);
