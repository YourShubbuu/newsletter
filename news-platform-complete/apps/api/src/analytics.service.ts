import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  sanitize(input: any) {
    const metadata: Record<string, unknown> = {};
    if (input?.metadata && typeof input.metadata === 'object') {
      for (const [k,v] of Object.entries(input.metadata).slice(0,40)) {
        if (typeof v === 'string') metadata[k.slice(0,80)] = v.slice(0,500);
        else if (typeof v === 'number' || typeof v === 'boolean') metadata[k.slice(0,80)] = v;
      }
    }
    return {
      eventName: String(input?.eventName || 'unknown').slice(0,100),
      articleId: input?.articleId || null,
      path: String(input?.path || '').slice(0,1000),
      referrer: String(input?.referrer || '').slice(0,1000),
      metadata,
    };
  }
}
