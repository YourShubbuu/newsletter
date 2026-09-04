'use client';

import { useEffect, useState } from 'react';

export function ArticleActions({ slug }: { slug: string }) {
  const storageKey = `news:saved:${slug}`;
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setSaved(window.localStorage.getItem(storageKey) === '1');
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }, [storageKey]);

  function toggleSaved() {
    setSaved(current => {
      const next = !current;
      try {
        if (next) window.localStorage.setItem(storageKey, '1');
        else window.localStorage.removeItem(storageKey);
      } catch {
        // Keep the UI usable even when persistent browser storage is unavailable.
      }
      return next;
    });
  }

  async function share() {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Unable to share article', error);
    }
  }

  return (
    <div className="article-actions" aria-label="Article actions">
      <button type="button" onClick={toggleSaved} aria-pressed={saved}>
        {saved ? 'Saved on this device' : 'Save on this device'}
      </button>
      <button type="button" onClick={share}>{copied ? 'Link copied' : 'Share'}</button>
    </div>
  );
}
