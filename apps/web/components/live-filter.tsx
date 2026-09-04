'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Story = { id: string; slug: string; title: string; subtitle?: string | null; publishedAt?: string | null; kind?: string | null };

const windows = [{ label: 'NOW', minutes: 60 }, { label: '15M', minutes: 15 }, { label: '1H', minutes: 60 }, { label: '3H', minutes: 180 }, { label: 'TODAY', minutes: 1440 }];

export function LiveFilter({ stories }: { stories: Story[] }) {
  const [windowMinutes, setWindowMinutes] = useState(1440);
  const visible = useMemo(() => {
    const cutoff = Date.now() - windowMinutes * 60_000;
    return stories.filter(s => !s.publishedAt || new Date(s.publishedAt).getTime() >= cutoff);
  }, [stories, windowMinutes]);
  return <section className="live-desk" aria-labelledby="live-desk-heading">
    <div className="live-desk-head"><div><p className="eyebrow">DEVELOPING / THE LIVE EDITION</p><h2 id="live-desk-heading">What just changed</h2></div><div className="time-filters" role="group" aria-label="Filter stories by recency">{windows.map(w => <button key={w.label} className={windowMinutes === w.minutes ? 'active' : ''} onClick={() => setWindowMinutes(w.minutes)} type="button">{w.label}</button>)}</div></div>
    <div className="live-list">{visible.length ? visible.map(story => <Link key={story.id} href={`/story/${story.slug}`} className="live-item"><span className="live-kind">{story.kind || 'STORY'}</span><strong>{story.title}</strong><span>{story.subtitle}</span></Link>) : <p className="empty-editorial-state">No published stories in this time window.</p>}</div>
  </section>;
}
