'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Result = { id: string; slug: string; title: string; subtitle?: string | null };

export function ReaderSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!q.trim()) { setResults([]); return; }
      const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '';
      const api = base.endsWith('/api') ? base : `${base}/api`;
      const response = await fetch(`${api}/public/search?q=${encodeURIComponent(q)}`);
      if (response.ok) setResults((await response.json()).results ?? []);
    }, 200);
    return () => clearTimeout(timer);
  }, [q]);
  return <main className="search-page"><p className="eyebrow">SEARCH THE DESK</p><h1>Search</h1><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search stories, topics, authors…" aria-label="Search stories" />
    <div className="search-results">{results.map(r => <Link className="search-result" key={r.id} href={`/story/${r.slug}`}><strong>{r.title}</strong><span>{r.subtitle}</span></Link>)}</div>
  </main>;
}
