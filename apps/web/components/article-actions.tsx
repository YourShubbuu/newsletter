'use client';
import { useEffect, useState } from 'react';
function apiBase() { const value = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, ''); return value ? (value.endsWith('/api') ? value : `${value}/api`) : 'http://localhost:4000/api'; }
export function ArticleActions({ slug }: { slug: string }) {
  const storageKey = `news:saved:${slug}`; const [saved, setSaved] = useState(false); const [accountSaved, setAccountSaved] = useState(false); const [copied, setCopied] = useState(false);
  useEffect(() => { fetch(`${apiBase()}/public/saved/${encodeURIComponent(slug)}`, { credentials: 'include' }).then(async r => { if (r.ok) { const d = await r.json(); setSaved(Boolean(d.saved)); setAccountSaved(true); return; } try { setSaved(window.localStorage.getItem(storageKey) === '1'); } catch {} }).catch(() => { try { setSaved(window.localStorage.getItem(storageKey) === '1'); } catch {} }); }, [slug, storageKey]);
  async function toggleSaved() { const next = !saved; setSaved(next); if (accountSaved) { const response = await fetch(`${apiBase()}/public/saved/${encodeURIComponent(slug)}`, { method: next ? 'POST' : 'DELETE', credentials: 'include' }); if (!response.ok) setSaved(!next); return; } try { if (next) window.localStorage.setItem(storageKey, '1'); else window.localStorage.removeItem(storageKey); } catch {} }
  async function share() { try { const url = window.location.href; if (navigator.share) { await navigator.share({ title: document.title, url }); return; } await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return; } }
  return <div className="article-actions" aria-label="Article actions"><button type="button" onClick={toggleSaved} aria-pressed={saved}>{saved ? (accountSaved ? 'Saved' : 'Saved on this device') : 'Save story'}</button><button type="button" onClick={share}>{copied ? 'Link copied' : 'Share'}</button></div>;
}
