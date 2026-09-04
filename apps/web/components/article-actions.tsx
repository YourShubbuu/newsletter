'use client';

import { useState } from 'react';

export function ArticleActions({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: document.title, url });
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); }
  }
  return <div className="article-actions" aria-label="Article actions">
    <button type="button" onClick={() => setSaved(v => !v)} aria-pressed={saved}>{saved ? 'Saved' : 'Save'}</button>
    <button type="button" onClick={share}>{copied ? 'Link copied' : 'Share'}</button>
  </div>;
}
