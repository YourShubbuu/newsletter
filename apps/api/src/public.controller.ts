import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('/public')
export class PublicController {
  @Get('/articles')
  async articles(@Query('limit') limit = '30') {
    return { articles: [], limit: Math.min(Number(limit) || 30, 500) };
  }
  @Get('/articles/:slug') async article(@Param('slug') slug: string) { return { slug }; }
  @Get('/search') async search(@Query('q') q = '') { return { q, results: [] }; }
}
