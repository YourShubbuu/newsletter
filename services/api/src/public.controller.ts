import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { asc, desc, eq, ilike, or } from 'drizzle-orm';
import { db, schema } from '@news/db';

@Controller('public')
export class PublicController {
  @Get('articles')
  async articles(@Query('section') section?: string) {
    const rows = await db.select().from(schema.articles)
      .where(eq(schema.articles.status, 'PUBLISHED'))
      .orderBy(desc(schema.articles.publishedAt), desc(schema.articles.updatedAt))
      .limit(100);
    return section ? rows.filter(row => String(row.kind).toLowerCase() === section.toLowerCase()) : rows;
  }

  @Get('articles/:slug')
  async article(@Param('slug') slug: string) {
    const [article] = await db.select().from(schema.articles).where(eq(schema.articles.slug, slug)).limit(1);
    if (!article || article.status !== 'PUBLISHED') throw new NotFoundException('Story not found');
    const blocks = await db.select().from(schema.articleBlocks)
      .where(eq(schema.articleBlocks.articleId, article.id)).orderBy(asc(schema.articleBlocks.position));
    return { article, blocks };
  }

  @Get('search')
  async search(@Query('q') q = '') {
    const term = q.trim();
    if (!term) return { results: [] };
    const results = await db.select().from(schema.articles)
      .where(or(ilike(schema.articles.title, `%${term}%`), ilike(schema.articles.subtitle, `%${term}%`)))
      .orderBy(desc(schema.articles.publishedAt)).limit(50);
    return { results: results.filter(row => row.status === 'PUBLISHED') };
  }
}
