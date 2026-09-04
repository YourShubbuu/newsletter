import Link from 'next/link';

const sectionNames: Record<string, string> = { live: 'Live', world: 'World', business: 'Business', technology: 'Technology', science: 'Science', culture: 'Culture' };

async function getStories(section: string) {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  const api = configured ? (configured.endsWith('/api') ? configured : `${configured}/api`) : 'http://localhost:4000/api';
  try {
    const response = await fetch(`${api}/public/articles?section=${encodeURIComponent(section)}`, { next: { revalidate: 30 } });
    return response.ok ? response.json() : [];
  } catch { return []; }
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const key = section.toLowerCase();
  const name = sectionNames[key] ?? section;
  const stories = await getStories(key);
  return <main className="section-page">
    <p className="eyebrow">SECTION</p><h1>{name}</h1>
    <p className="section-intro">The latest reporting, explainers, and analysis from {name.toLowerCase()}.</p>
    {stories.length ? <div className="section-stories">{stories.map((story: any) => <Link key={story.id} href={`/story/${story.slug}`} className="section-story"><span className="eyebrow">{story.kind || 'STORY'}</span><h2>{story.title}</h2>{story.subtitle && <p>{story.subtitle}</p>}<small>{story.publishedAt ? new Date(story.publishedAt).toLocaleString() : 'PUBLISHED'}</small></Link>)}</div> : <div className="empty-editorial-state"><strong>No stories in this section yet.</strong><span>Published stories will appear here automatically.</span><Link href="/">Return to the front page</Link></div>}
  </main>;
}
