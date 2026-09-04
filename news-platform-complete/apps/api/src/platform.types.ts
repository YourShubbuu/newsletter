export type ArticleStatus =
  | 'DRAFT' | 'IN_REVIEW' | 'COPY_EDIT' | 'APPROVED'
  | 'SCHEDULED' | 'PUBLISHED' | 'UPDATED' | 'ARCHIVED';

export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'image'; mediaId: string; alt: string; caption?: string }
  | { type: 'divider' }
  | { type: 'embed'; provider: string; url: string; caption?: string };
