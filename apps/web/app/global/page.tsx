import { ReaderHeader } from '@/components/reader-shell';

type WireArticle = { title: string; url: string; seendate?: string; domain?: string; language?: string; sourcecountry?: string; socialimage?: string };

async function getWire(): Promise<WireArticle[]> {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  const api = configured ? (configured.endsWith('/api') ? configured : `${configured}/api`) : 'http://localhost:4000/api';
  try { const r = await fetch(`${api}/global/wire?limit=60`, { next: { revalidate: 60 } }); return r.ok ? r.json() : []; } catch { return []; }
}

export default async function GlobalPage() {
  const stories = await getWire();
  return <><ReaderHeader /><main className="global-page"><div className="global-heading"><p className="eyebrow">LIVE / WORLDWIDE</p><h1>The Global Wire</h1><p>Fresh headlines from newsrooms and publishers around the world. Read the full story at its original source.</p></div><div className="wire-grid">{stories.map((story, i) => <article className={i === 0 ? 'wire-story lead-wire' : 'wire-story'} key={`${story.url}-${i}`}>{story.socialimage && <img src={story.socialimage} alt="" loading="lazy" /> }<div><span>{story.domain || 'GLOBAL SOURCE'}{story.sourcecountry ? ` · ${story.sourcecountry}` : ''}</span><h2><a href={story.url} target="_blank" rel="noreferrer">{story.title}</a></h2><time>{story.seendate ? new Date(story.seendate).toLocaleString() : 'Latest'}</time></div></article>)}</div>{!stories.length && <div className="empty-editorial-state"><strong>The wire is temporarily quiet.</strong><span>Refresh shortly for the latest global headlines.</span></div>}</main></>;
}
