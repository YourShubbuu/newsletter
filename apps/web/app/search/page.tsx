'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ReaderHeader } from '@/components/reader-shell';

type SearchResult = { id: string; slug: string; title: string; subtitle?: string | null };

function getApiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (configured) return configured.endsWith('/api') ? configured : `${configured}/api`;
  return process.env.NODE_ENV === 'development' ? 'http://localhost:4000/api' : '';
}

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const id = window.setTimeout(async () => {
      const term = q.trim();
      if (!term) {
        setResults([]);
        return;
      }

      const api = getApiBase();
      if (!api) return;

      try {
        const response = await fetch(`${api}/public/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (response.ok) setResults((await response.json()).results ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Archive search failed', error);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(id);
    };
  }, [q]);

  return (
    <>
      <ReaderHeader />
      <main className="search-page">
        <p className="eyebrow">SEARCH THE ARCHIVE</p>
        <h1>Search</h1>
        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search stories, topics, authors…" aria-label="Search" />
        <div>
          {results.map(r => (
            <Link className="search-result" key={r.id} href={`/story/${r.slug}`}>
              <strong>{r.title}</strong>
              <span>{r.subtitle}</span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
