import { Controller, Get, Query } from '@nestjs/common';

type WireArticle = { title?: string; url?: string; seendate?: string; domain?: string; language?: string; sourcecountry?: string; socialimage?: string };
let cache: { at: number; articles: WireArticle[] } = { at: 0, articles: [] };

const query = '(election OR economy OR conflict OR technology OR science OR climate OR health OR culture OR diplomacy)';

@Controller('global')
export class GlobalController {
  @Get('wire')
  async wire(@Query('limit') limit = '60') {
    const count = Math.min(100, Math.max(12, Number.parseInt(limit, 10) || 60));
    if (Date.now() - cache.at < 60_000 && cache.articles.length) return cache.articles.slice(0, count);
    const params = new URLSearchParams({ query, mode: 'artlist', format: 'json', maxrecords: '100', timespan: '24h', sort: 'datedesc' });
    try {
      const response = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`, { headers: { 'user-agent': 'NewsPlatform/1.0 global-wire' }, signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(`GDELT ${response.status}`);
      const payload = await response.json() as { articles?: WireArticle[] };
      const articles = (payload.articles ?? []).filter(a => a.title && a.url);
      cache = { at: Date.now(), articles };
      return articles.slice(0, count);
    } catch {
      return cache.articles.slice(0, count);
    }
  }
}
