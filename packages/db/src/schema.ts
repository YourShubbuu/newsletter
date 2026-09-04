import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const articleStatus = pgEnum("article_status", [
  "DRAFT", "IN_REVIEW", "COPY_EDIT", "APPROVED", "SCHEDULED",
  "PUBLISHED", "UPDATED", "ARCHIVED"
]);

export const articleKind = pgEnum("article_kind", [
  "MAJOR", "STANDARD", "BRIEF", "LIVE", "EXPLAINER",
  "INVESTIGATION", "OPINION", "DATA", "VIDEO"
]);

export const workflowState = pgEnum("workflow_state", [
  "DRAFT", "IN_REVIEW", "COPY_EDIT", "APPROVED",
  "SCHEDULED", "PUBLISHED", "UPDATED", "ARCHIVED"
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  displayName: varchar("display_name", { length: 160 }).notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("users_email_idx").on(t.email)]);

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
});

export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
});

export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.userId, t.roleId] })]);

export const rolePermissions = pgTable("role_permissions", {
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]);

export const authors = pgTable("authors", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  expertise: text("expertise").array().notNull().default([]),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull().unique(),
});

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull().unique(),
  description: text("description"),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull().unique(),
});

export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 240 }).notNull().unique(),
  title: varchar("title", { length: 300 }).notNull(),
  subtitle: text("subtitle"),
  status: articleStatus("status").notNull().default("DRAFT"),
  kind: articleKind("kind").notNull().default("STANDARD"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  seoTitle: varchar("seo_title", { length: 300 }),
  seoDescription: varchar("seo_description", { length: 320 }),
  canonicalUrl: text("canonical_url"),
}, (t) => [
  index("articles_status_published_idx").on(t.status, t.publishedAt),
  index("articles_scheduled_idx").on(t.scheduledAt),
]);

export const articleAuthors = pgTable("article_authors", {
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => authors.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.articleId, t.authorId] })]);

export const articleCategories = pgTable("article_categories", {
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.articleId, t.categoryId] })]);

export const articleTopics = pgTable("article_topics", {
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.articleId, t.topicId] })]);

export const articleTags = pgTable("article_tags", {
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.articleId, t.tagId] })]);

export const articleBlocks = pgTable("article_blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 80 }).notNull(),
  position: integer("position").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("article_blocks_article_position_idx").on(t.articleId, t.position)]);

export const articleRevisions = pgTable("article_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  revisionNumber: integer("revision_number").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("article_revisions_article_idx").on(t.articleId, t.revisionNumber),
]);

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: varchar("kind", { length: 40 }).notNull(),
  storageKey: text("storage_key").notNull().unique(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  filename: varchar("filename", { length: 300 }).notNull(),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  caption: text("caption"),
  credit: text("credit"),
  copyright: text("copyright"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaUsage = pgTable("media_usage", {
  mediaId: uuid("media_id").notNull().references(() => media.id, { onDelete: "cascade" }),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  usage: varchar("usage", { length: 60 }).notNull(),
}, (t) => [primaryKey({ columns: [t.mediaId, t.articleId, t.usage] })]);

export const savedArticles = pgTable("saved_articles", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.articleId] }),
  index("saved_articles_user_created_idx").on(t.userId, t.createdAt),
]);

export const readingHistory = pgTable("reading_history", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  lastReadAt: timestamp("last_read_at", { withTimezone: true }).notNull().defaultNow(),
  progressPercent: integer("progress_percent").notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.userId, t.articleId] }),
  index("reading_history_user_last_read_idx").on(t.userId, t.lastReadAt),
]);

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  parentId: uuid("parent_id"),
  body: text("body").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  isRemoved: boolean("is_removed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("comments_article_created_idx").on(t.articleId, t.createdAt),
]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("audit_logs_entity_idx").on(t.entityType, t.entityId),
  index("audit_logs_actor_idx").on(t.actorUserId, t.createdAt),
]);

export const articleEvents = pgTable("article_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("article_events_article_created_idx").on(t.articleId, t.createdAt)]);

export const articleViews = pgTable("article_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  anonymousKey: varchar("anonymous_key", { length: 128 }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("article_views_article_time_idx").on(t.articleId, t.viewedAt),
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 80 }).notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  body: text("body"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  breakingNews: boolean("breaking_news").notNull().default(false),
  topicAlerts: boolean("topic_alerts").notNull().default(false),
  authorAlerts: boolean("author_alerts").notNull().default(false),
  savedStoryUpdates: boolean("saved_story_updates").notNull().default(false),
});

export const newsletters = pgTable("newsletters", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  newsletterId: uuid("newsletter_id").notNull().references(() => newsletters.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 320 }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
}, (t) => [
  primaryKey({ columns: [t.newsletterId, t.email] }),
]);

export const editorialWorkflows = pgTable("editorial_workflows", {
  articleId: uuid("article_id").primaryKey().references(() => articles.id, { onDelete: "cascade" }),
  state: workflowState("state").notNull().default("DRAFT"),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("sessions_user_idx").on(t.userId),
  index("sessions_expires_idx").on(t.expiresAt),
]);
