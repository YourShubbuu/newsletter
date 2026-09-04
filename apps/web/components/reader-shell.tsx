'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const sections = ['LIVE', 'WORLD', 'BUSINESS', 'TECHNOLOGY', 'SCIENCE', 'CULTURE'];

export function ReaderHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const value = query.trim();
    if (value) router.push(`/search?q=${encodeURIComponent(value)}`);
    else router.push('/search');
    setOpen(false);
  }

  return (
    <header className="reader-header">
      <Link className="brand" href="/" aria-label="Home">[NEWS BRAND NAME]</Link>
      <nav className="section-nav" aria-label="Sections">
        {sections.map(section => (
          <Link key={section} className={pathname === `/section/${section.toLowerCase()}` ? 'active' : ''} href={`/section/${section.toLowerCase()}`}>
            {section}
          </Link>
        ))}
      </nav>
      <button className="search-toggle" type="button" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="site-search">Search</button>
      {open && (
        <form id="site-search" className="search-popover" onSubmit={submitSearch}>
          <label htmlFor="site-search-input">Search stories</label>
          <input id="site-search-input" autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search stories, topics, authors…" />
        </form>
      )}
    </header>
  );
}
