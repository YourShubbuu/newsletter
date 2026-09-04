import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller()
export class PlatformController {
  constructor(private readonly analytics: AnalyticsService) {}
  @Get('/health') health() { return { status: 'ok', service: 'api' }; }
  @Get('/ready') ready() { return { status: 'ready' }; }
  @Post('/events') ingest(@Body() body: any, @Headers('x-request-id') requestId?: string) {
    return { accepted: true, requestId: requestId || null, event: this.analytics.sanitize(body) };
  }
}
