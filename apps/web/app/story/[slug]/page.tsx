import { notFound } from 'next/navigation';
import { ReaderHeader } from '@/components/reader-shell';
import { ArticleActions } from '@/components/article-actions';
import { ReadingProgress } from '@/components/reading-progress';

function getApiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (configured) return configured.endsWith('/api') ? configured : `${configured}/api`;
  return 'http://localhost:4000/api';
}

async function getArticle(slug: string) {
  const res = await fetch(`${getApiBase()}/public/articles/${encodeURIComponent(slug)}`, { next: { revalidate: 30 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load story');
  return res.json();
}

function Block({ block }: { block: any }) {
  const data = block.data ?? block;
  switch (block.type) {
    case 'heading': return <h2>{data.text}</h2>;
    case 'quote': return <blockquote>{data.text}{data.attribution && <cite>{data.attribution}</cite>}</blockquote>;
    case 'image': return <figure><img src={data.url} alt={data.alt || ''}/>{data.caption && <figcaption>{data.caption}</figcaption>}</figure>;
    case 'divider': return <hr/>;
    case 'embed': return <figure><a href={data.url} rel="noreferrer">{data.caption || data.url}</a></figure>;
    default: return <p>{data.text || ''}</p>;
  }
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getArticle(slug);
  if (!result) notFound();
  const { article, blocks } = result;
  return <><ReaderHeader /><ReadingProgress /><main className="story-page"><article>
    <div className="story-kicker">{article.kind || 'STORY'}</div>
    <h1>{article.title}</h1>
    {article.subtitle && <p className="story-deck">{article.subtitle}</p>}
    <div className="story-meta"><span>STAFF</span><time>{article.publishedAt ? new Date(article.publishedAt).toLocaleString() : 'Published'}</time></div>
    <ArticleActions slug={slug} />
    <div className="story-body">{(blocks || []).map((b: any, i: number) => <Block key={b.id || i} block={b}/>)}</div>
  </article></main></>;
}
