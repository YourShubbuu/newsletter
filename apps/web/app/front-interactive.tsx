'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const stories = [
  { slug: 'cities-prepare-for-an-ai-powered-generation-of-public-services', kicker: 'MAJOR STORY', title: 'Cities prepare for an AI-powered generation of public services', deck: 'Local governments are moving from experiments to infrastructure, raising new questions about transparency and trust.', author: 'MAYA SEN', read: '8 MIN READ' },
  { slug: 'the-new-energy-map-is-taking-shape', kicker: 'DATA', title: 'The new energy map is taking shape', read: '6 MIN READ' },
  { slug: 'why-the-next-ai-race-is-about-infrastructure', kicker: 'EXPLAINER', title: 'Why the next AI race is about infrastructure', read: '9 MIN READ' },
];

export function FrontInteractive() {
  const [mode, setMode] = useState<'all' | 'short'>('all');
  const visible = useMemo(() => mode === 'short' ? stories.filter(s => s.read.startsWith('6')) : stories, [mode]);
  return <main className="front-page">
    <div className="front-toolbar"><span>• DEVELOPING / THE LIVE EDITION</span><div><button className={mode === 'all' ? 'active' : ''} onClick={() => setMode('all')}>ALL STORIES</button><button className={mode === 'short' ? 'active' : ''} onClick={() => setMode('short')}>QUICK READS</button></div></div>
    <section className="hero-grid">
      {visible.map((story, i) => <article key={story.slug} className={i === 0 ? 'lead-story' : 'side-story'}><Link href={`/story/${story.slug}`}><p className="eyebrow">{story.kicker}</p><h2>{story.title}</h2>{story.deck && <p>{story.deck}</p>}<small>{story.author ? `${story.author} · ` : ''}{story.read}</small></Link></article>)}
    </section>
    <section className="front-actions"><Link href="/reader">Open the live desk →</Link><Link href="/search">Search the archive →</Link></section>
  </main>;
}
