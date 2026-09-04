import { Controller, Get, Query, Param, NotFoundException, Post, Delete, Req } from '@nestjs/common';
import type { Request } from 'express';
import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import { db, schema } from '@news/db';
import { SESSION_COOKIE } from '@news/auth';
import { AuthServiceImpl } from './auth/auth.service';

@Controller('public')
export class PublicController {
  constructor(private readonly auth: AuthServiceImpl) {}
  @Get('articles')
  async articles(@Query('section') section?: string) {
    const normalizedSection = section?.trim().toLowerCase();
    if (normalizedSection === 'live') return db.select().from(schema.articles).where(and(eq(schema.articles.status, 'PUBLISHED'), eq(schema.articles.kind, 'LIVE'))).orderBy(desc(schema.articles.publishedAt), desc(schema.articles.updatedAt)).limit(100);
    if (normalizedSection) return db.select({ id: schema.articles.id, slug: schema.articles.slug, title: schema.articles.title, subtitle: schema.articles.subtitle, status: schema.articles.status, kind: schema.articles.kind, publishedAt: schema.articles.publishedAt, updatedAt: schema.articles.updatedAt, createdAt: schema.articles.createdAt }).from(schema.articles).innerJoin(schema.articleCategories, eq(schema.articleCategories.articleId, schema.articles.id)).innerJoin(schema.categories, eq(schema.categories.id, schema.articleCategories.categoryId)).where(and(eq(schema.articles.status, 'PUBLISHED'), eq(schema.categories.slug, normalizedSection))).orderBy(desc(schema.articles.publishedAt), desc(schema.articles.updatedAt)).limit(100);
    return db.select().from(schema.articles).where(eq(schema.articles.status, 'PUBLISHED')).orderBy(desc(schema.articles.publishedAt), desc(schema.articles.updatedAt)).limit(100);
  }

  @Get('articles/:slug')
  async article(@Param('slug') slug: string) {
    const [article] = await db.select().from(schema.articles).where(eq(schema.articles.slug, slug)).limit(1);
    if (!article || article.status !== 'PUBLISHED') throw new NotFoundException('Story not found');
    const blocks = await db.select().from(schema.articleBlocks).where(eq(schema.articleBlocks.articleId, article.id)).orderBy(asc(schema.articleBlocks.position));
    return { article, blocks };
  }

  @Get('search')
  async search(@Query('q') q = '') {
    const term = q.trim(); if (!term) return { results: [] };
    const results = await db.select().from(schema.articles).where(and(eq(schema.articles.status, 'PUBLISHED'), or(ilike(schema.articles.title, `%${term}%`), ilike(schema.articles.subtitle, `%${term}%`)))).orderBy(desc(schema.articles.publishedAt), desc(schema.articles.updatedAt)).limit(50);
    return { results };
  }

  @Get('saved/:slug')
  async saved(@Param('slug') slug: string, @Req() request: Request) {
    const user = await this.auth.requireUser(request.cookies?.[SESSION_COOKIE]);
    const [article] = await db.select({ id: schema.articles.id }).from(schema.articles).where(eq(schema.articles.slug, slug)).limit(1);
    if (!article) throw new NotFoundException('Story not found');
    const [row] = await db.select().from(schema.savedArticles).where(and(eq(schema.savedArticles.userId, user.id), eq(schema.savedArticles.articleId, article.id))).limit(1);
    return { saved: Boolean(row) };
  }

  @Post('saved/:slug')
  async save(@Param('slug') slug: string, @Req() request: Request) {
    const user = await this.auth.requireUser(request.cookies?.[SESSION_COOKIE]);
    const [article] = await db.select({ id: schema.articles.id }).from(schema.articles).where(and(eq(schema.articles.slug, slug), eq(schema.articles.status, 'PUBLISHED'))).limit(1);
    if (!article) throw new NotFoundException('Story not found');
    await db.insert(schema.savedArticles).values({ userId: user.id, articleId: article.id }).onConflictDoNothing();
    return { saved: true };
  }

  @Delete('saved/:slug')
  async unsave(@Param('slug') slug: string, @Req() request: Request) {
    const user = await this.auth.requireUser(request.cookies?.[SESSION_COOKIE]);
    const [article] = await db.select({ id: schema.articles.id }).from(schema.articles).where(eq(schema.articles.slug, slug)).limit(1);
    if (article) await db.delete(schema.savedArticles).where(and(eq(schema.savedArticles.userId, user.id), eq(schema.savedArticles.articleId, article.id)));
    return { saved: false };
  }
}
