import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@news/db";

const transitions: Record<string, string[]> = {
  DRAFT: ["IN_REVIEW"],
  IN_REVIEW: ["DRAFT", "COPY_EDIT"],
  COPY_EDIT: ["IN_REVIEW", "APPROVED"],
  APPROVED: ["COPY_EDIT", "SCHEDULED", "PUBLISHED"],
  SCHEDULED: ["APPROVED", "PUBLISHED"],
  PUBLISHED: ["UPDATED", "ARCHIVED"],
  UPDATED: ["PUBLISHED", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

@Injectable()
export class ArticlesService {
  async list() {
    return db.select().from(schema.articles).orderBy(desc(schema.articles.updatedAt)).limit(100);
  }

  async get(id: string) {
    const [article] = await db.select().from(schema.articles).where(eq(schema.articles.id, id)).limit(1);
    if (!article) throw new NotFoundException("Article not found");
    const blocks = await db.select().from(schema.articleBlocks).where(eq(schema.articleBlocks.articleId, id)).orderBy(asc(schema.articleBlocks.position));
    return { article, blocks };
  }

  async create(input: { title?: string; kind?: typeof schema.articles.$inferInsert.kind }, _userId: string) {
    const title = input.title?.trim() || "Untitled story";
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 220) || "untitled-story";
    const slug = `${slugBase}-${Date.now().toString(36)}`;
    const [article] = await db.insert(schema.articles).values({ title, slug, kind: input.kind ?? "STANDARD", status: "DRAFT" }).returning();
    if (!article) throw new BadRequestException("Article could not be created");
    await db.insert(schema.editorialWorkflows).values({ articleId: article.id, state: "DRAFT" });
    return this.get(article.id);
  }

  async update(id: string, input: { title?: string; subtitle?: string; kind?: any; seoTitle?: string; seoDescription?: string; blocks?: Array<{ id?: string; type: string; data: unknown }> }, userId: string) {
    const existing = await this.get(id);
    const nextBlocks = input.blocks ?? existing.blocks.map(({ id: blockId, type, data }) => ({ id: blockId, type, data }));
    await db.transaction(async (tx) => {
      await tx.update(schema.articles).set({
        title: input.title?.trim() || existing.article.title,
        subtitle: input.subtitle ?? existing.article.subtitle,
        kind: input.kind ?? existing.article.kind,
        seoTitle: input.seoTitle ?? existing.article.seoTitle,
        seoDescription: input.seoDescription ?? existing.article.seoDescription,
        updatedAt: new Date(),
      }).where(eq(schema.articles.id, id));
      await tx.delete(schema.articleBlocks).where(eq(schema.articleBlocks.articleId, id));
      if (nextBlocks.length) await tx.insert(schema.articleBlocks).values(nextBlocks.map((block, position) => ({ articleId: id, type: block.type, position, data: block.data })));
      const revisionCount = await tx.select({ count: sql<number>`count(*)` }).from(schema.articleRevisions).where(eq(schema.articleRevisions.articleId, id));
      const revisionNumber = Number(revisionCount[0]?.count ?? 0) + 1;
      await tx.insert(schema.articleRevisions).values({ articleId: id, revisionNumber, createdBy: userId, snapshot: { ...input, blocks: nextBlocks } });
      await tx.insert(schema.auditLogs).values({ actorUserId: userId, action: "article.autosaved", entityType: "article", entityId: id, metadata: { revisionNumber } });
    });
    return this.get(id);
  }

  async transition(id: string, to: string, userId: string) {
    const existing = await this.get(id);
    if (!transitions[existing.article.status]?.includes(to)) throw new BadRequestException(`Invalid transition ${existing.article.status} -> ${to}`);
    await db.transaction(async (tx) => {
      await tx.update(schema.articles).set({ status: to as any, publishedAt: to === "PUBLISHED" ? new Date() : existing.article.publishedAt, updatedAt: new Date() }).where(eq(schema.articles.id, id));
      await tx.update(schema.editorialWorkflows).set({ state: to as any, updatedBy: userId, updatedAt: new Date() }).where(eq(schema.editorialWorkflows.articleId, id));
      await tx.insert(schema.articleEvents).values({ articleId: id, type: `workflow.${to.toLowerCase()}`, payload: { from: existing.article.status, to, userId } });
      await tx.insert(schema.auditLogs).values({ actorUserId: userId, action: "article.workflow_transition", entityType: "article", entityId: id, metadata: { from: existing.article.status, to } });
    });
    return this.get(id);
  }
}
