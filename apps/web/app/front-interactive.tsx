'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Story = { id: string; slug: string; title: string; subtitle?: string | null; publishedAt?: string | null; kind?: string | null };

export function FrontInteractive({ stories }: { stories: Story[] }) {
  const [mode, setMode] = useState<'all' | 'short'>('all');
  const visible = useMemo(() => mode === 'short' ? stories.filter(s => s.title.length < 90) : stories, [mode, stories]);
  const [lead, ...side] = visible;
  return <main className="front-page">
    <div className="front-toolbar"><span>• DEVELOPING / THE LIVE EDITION</span><div><button className={mode === 'all' ? 'active' : ''} onClick={() => setMode('all')}>ALL STORIES</button><button className={mode === 'short' ? 'active' : ''} onClick={() => setMode('short')}>QUICK READS</button></div></div>
    {lead ? <section className="hero-grid">
      <article className="lead-story"><Link href={`/story/${lead.slug}`}><p className="eyebrow">{lead.kind || 'MAJOR STORY'}</p><h1>{lead.title}</h1>{lead.subtitle && <p>{lead.subtitle}</p>}<small>{lead.publishedAt ? new Date(lead.publishedAt).toLocaleString() : 'PUBLISHED'}</small></Link></article>
      <aside className="side-stories">{side.slice(0, 3).map(story => <Link key={story.id} href={`/story/${story.slug}`}><span className="eyebrow">{story.kind || 'STORY'}</span><h2>{story.title}</h2><small>{story.publishedAt ? new Date(story.publishedAt).toLocaleString() : 'PUBLISHED'}</small></Link>)}</aside>
    </section> : <div className="empty-editorial-state"><strong>No published stories yet.</strong><span>The front page will populate automatically when the editorial desk publishes its first story.</span></div>}
    <section className="front-actions"><Link href="/reader">Open the live desk →</Link><Link href="/search">Search the archive →</Link></section>
  </main>;
}
