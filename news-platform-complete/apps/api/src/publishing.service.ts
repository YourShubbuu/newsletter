import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class PublishingService {
  createPreviewToken() { return randomBytes(36).toString('base64url'); }

  assertPublishable(article: any) {
    if (!article) throw new NotFoundException('Article not found');
    if (!article.headline?.trim()) throw new BadRequestException('Headline is required');
    if (!article.blocks?.length) throw new BadRequestException('At least one content block is required');
    if (!['APPROVED','SCHEDULED','PUBLISHED','UPDATED'].includes(article.status)) {
      throw new BadRequestException(`Article status ${article.status} is not publishable`);
    }
    return true;
  }
}
