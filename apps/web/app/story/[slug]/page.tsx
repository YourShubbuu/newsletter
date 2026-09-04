import { notFound } from 'next/navigation';

function getApiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (configured) return configured.endsWith('/api') ? configured : `${configured}/api`;
  return 'http://localhost:4000/api';
}

async function getArticle(slug:string) {
  const res = await fetch(`${getApiBase()}/public/articles/${encodeURIComponent(slug)}`, { next:{ revalidate:30 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load story');
  return res.json();
}
function Block({block}:{block:any}) {
  switch(block.type) {
    case 'heading': return <h2>{block.text}</h2>;
    case 'quote': return <blockquote>{block.text}{block.attribution && <cite>{block.attribution}</cite>}</blockquote>;
    case 'image': return <figure><img src={block.url} alt={block.alt || ''}/>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
    case 'divider': return <hr/>;
    case 'embed': return <figure><a href={block.url} rel="noreferrer">{block.caption || block.url}</a></figure>;
    default: return <p>{block.text}</p>;
  }
}
export default async function StoryPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const article=await getArticle(slug); if(!article) notFound();
  return <main className="story-page"><article>
    <div className="story-kicker">{article.category?.name || article.type}</div>
    <h1>{article.headline}</h1>
    {article.deck && <p className="story-deck">{article.deck}</p>}
    <div className="story-meta"><span>{article.author?.displayName || 'Staff'}</span><time>{new Date(article.publishedAt).toLocaleString()}</time></div>
    <div className="story-body">{(article.blocks||[]).map((b:any,i:number)=><Block key={i} block={b}/>)}</div>
    {article.correction && <aside className="correction"><strong>Correction</strong><p>{article.correction}</p></aside>}
  </article></main>;
}
