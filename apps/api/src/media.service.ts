import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class MediaService {
  keyFor(filename: string, contentHash: string) {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 120);
    return `media/${new Date().toISOString().slice(0,10)}/${contentHash.slice(0,16)}-${safe}`;
  }
  contentHash(bytes: Buffer) { return createHash('sha256').update(bytes).digest('hex'); }
  validateImage(mimeType: string, byteSize: number) {
    if (!new Set(['image/jpeg','image/png','image/webp','image/avif']).has(mimeType)) throw new Error('Unsupported image type');
    if (byteSize > 15 * 1024 * 1024) throw new Error('Image exceeds 15MB limit');
  }
}
