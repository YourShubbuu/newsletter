CREATE TYPE "article_status" AS ENUM ('DRAFT','IN_REVIEW','COPY_EDIT','APPROVED','SCHEDULED','PUBLISHED','UPDATED','ARCHIVED');
CREATE TYPE "article_kind" AS ENUM ('MAJOR','STANDARD','BRIEF','LIVE','EXPLAINER','INVESTIGATION','OPINION','DATA','VIDEO');
CREATE TYPE "workflow_state" AS ENUM ('DRAFT','IN_REVIEW','COPY_EDIT','APPROVED','SCHEDULED','PUBLISHED','UPDATED','ARCHIVED');

CREATE TABLE "users" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "email" varchar(320) NOT NULL UNIQUE, "display_name" varchar(160) NOT NULL, "email_verified" boolean NOT NULL DEFAULT false, "avatar_url" text, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now());
CREATE INDEX "users_email_idx" ON "users" ("email");

CREATE TABLE "roles" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" varchar(80) NOT NULL UNIQUE);
CREATE TABLE "permissions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "key" varchar(120) NOT NULL UNIQUE);
CREATE TABLE "user_roles" ("user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE, PRIMARY KEY ("user_id","role_id"));
CREATE TABLE "role_permissions" ("role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE, "permission_id" uuid NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE, PRIMARY KEY ("role_id","permission_id"));

CREATE TABLE "authors" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL, "slug" varchar(180) NOT NULL UNIQUE, "name" varchar(160) NOT NULL, "bio" text, "photo_url" text, "expertise" text[] NOT NULL DEFAULT '{}', "social_links" jsonb NOT NULL DEFAULT '{}', "created_at" timestamptz NOT NULL DEFAULT now());
CREATE TABLE "categories" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "slug" varchar(120) NOT NULL UNIQUE, "name" varchar(120) NOT NULL UNIQUE);
CREATE TABLE "topics" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "slug" varchar(180) NOT NULL UNIQUE, "name" varchar(180) NOT NULL UNIQUE, "description" text);
CREATE TABLE "tags" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "slug" varchar(120) NOT NULL UNIQUE, "name" varchar(120) NOT NULL UNIQUE);

CREATE TABLE "articles" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "slug" varchar(240) NOT NULL UNIQUE, "title" varchar(300) NOT NULL, "subtitle" text, "status" "article_status" NOT NULL DEFAULT 'DRAFT', "kind" "article_kind" NOT NULL DEFAULT 'STANDARD', "published_at" timestamptz, "scheduled_at" timestamptz, "updated_at" timestamptz NOT NULL DEFAULT now(), "created_at" timestamptz NOT NULL DEFAULT now(), "seo_title" varchar(300), "seo_description" varchar(320), "canonical_url" text);
CREATE INDEX "articles_status_published_idx" ON "articles" ("status","published_at");
CREATE INDEX "articles_scheduled_idx" ON "articles" ("scheduled_at");

CREATE TABLE "article_authors" ("article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "author_id" uuid NOT NULL REFERENCES "authors"("id") ON DELETE CASCADE, PRIMARY KEY ("article_id","author_id"));
CREATE TABLE "article_categories" ("article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE, PRIMARY KEY ("article_id","category_id"));
CREATE TABLE "article_topics" ("article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "topic_id" uuid NOT NULL REFERENCES "topics"("id") ON DELETE CASCADE, PRIMARY KEY ("article_id","topic_id"));
CREATE TABLE "article_tags" ("article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE, PRIMARY KEY ("article_id","tag_id"));

CREATE TABLE "article_blocks" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "type" varchar(80) NOT NULL, "position" integer NOT NULL, "data" jsonb NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now());
CREATE INDEX "article_blocks_article_position_idx" ON "article_blocks" ("article_id","position");

CREATE TABLE "article_revisions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "revision_number" integer NOT NULL, "snapshot" jsonb NOT NULL, "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT, "created_at" timestamptz NOT NULL DEFAULT now());
CREATE INDEX "article_revisions_article_idx" ON "article_revisions" ("article_id","revision_number");

CREATE TABLE "media" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "kind" varchar(40) NOT NULL, "storage_key" text NOT NULL UNIQUE, "mime_type" varchar(120) NOT NULL, "filename" varchar(300) NOT NULL, "width" integer, "height" integer, "alt_text" text, "caption" text, "credit" text, "copyright" text, "created_at" timestamptz NOT NULL DEFAULT now());
CREATE TABLE "media_usage" ("media_id" uuid NOT NULL REFERENCES "media"("id") ON DELETE CASCADE, "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "usage" varchar(60) NOT NULL, PRIMARY KEY ("media_id","article_id","usage"));

CREATE TABLE "saved_articles" ("user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "created_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("user_id","article_id"));
CREATE INDEX "saved_articles_user_created_idx" ON "saved_articles" ("user_id","created_at");
CREATE TABLE "reading_history" ("user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "last_read_at" timestamptz NOT NULL DEFAULT now(), "progress_percent" integer NOT NULL DEFAULT 0, PRIMARY KEY ("user_id","article_id"));
CREATE INDEX "reading_history_user_last_read_idx" ON "reading_history" ("user_id","last_read_at");

CREATE TABLE "comments" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT, "parent_id" uuid, "body" text NOT NULL, "is_approved" boolean NOT NULL DEFAULT false, "is_removed" boolean NOT NULL DEFAULT false, "created_at" timestamptz NOT NULL DEFAULT now());
CREATE INDEX "comments_article_created_idx" ON "comments" ("article_id","created_at");

CREATE TABLE "audit_logs" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "actor_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL, "action" varchar(120) NOT NULL, "entity_type" varchar(80) NOT NULL, "entity_id" uuid, "metadata" jsonb, "created_at" timestamptz NOT NULL DEFAULT now());
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" ("entity_type","entity_id");
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" ("actor_user_id","created_at");

CREATE TABLE "article_events" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "type" varchar(100) NOT NULL, "payload" jsonb, "created_at" timestamptz NOT NULL DEFAULT now());
CREATE INDEX "article_events_article_created_idx" ON "article_events" ("article_id","created_at");

CREATE TABLE "article_views" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE, "anonymous_key" varchar(128), "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL, "viewed_at" timestamptz NOT NULL DEFAULT now());
CREATE INDEX "article_views_article_time_idx" ON "article_views" ("article_id","viewed_at");

CREATE TABLE "notifications" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, "type" varchar(80) NOT NULL, "title" varchar(240) NOT NULL, "body" text, "read_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now());
CREATE TABLE "notification_preferences" ("user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE, "breaking_news" boolean NOT NULL DEFAULT false, "topic_alerts" boolean NOT NULL DEFAULT false, "author_alerts" boolean NOT NULL DEFAULT false, "saved_story_updates" boolean NOT NULL DEFAULT false);

CREATE TABLE "newsletters" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "slug" varchar(120) NOT NULL UNIQUE, "name" varchar(160) NOT NULL, "description" text);
CREATE TABLE "newsletter_subscriptions" ("newsletter_id" uuid NOT NULL REFERENCES "newsletters"("id") ON DELETE CASCADE, "email" varchar(320) NOT NULL, "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL, "confirmed_at" timestamptz, "unsubscribed_at" timestamptz, PRIMARY KEY ("newsletter_id","email"));

CREATE TABLE "editorial_workflows" ("article_id" uuid PRIMARY KEY REFERENCES "articles"("id") ON DELETE CASCADE, "state" "workflow_state" NOT NULL DEFAULT 'DRAFT', "updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL, "updated_at" timestamptz NOT NULL DEFAULT now());
