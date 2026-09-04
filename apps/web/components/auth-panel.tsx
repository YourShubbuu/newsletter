'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function apiBase() { const value = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, ''); return value ? (value.endsWith('/api') ? value : `${value}/api`) : 'http://localhost:4000/api'; }
type User = { id: string; email: string; displayName: string };

export function AuthPanel() {
  const router = useRouter(); const [user, setUser] = useState<User | null>(null); const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { fetch(`${apiBase()}/auth/me`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(d => setUser(d?.user ?? null)).catch(() => undefined); }, []);
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(''); try { const response = await fetch(`${apiBase()}/auth/${mode}`, { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password, ...(mode === 'signup' ? { displayName: name } : {}) }) }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || 'Authentication failed'); setUser(data.user); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed'); } finally { setBusy(false); } }
  async function logout() { await fetch(`${apiBase()}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => undefined); setUser(null); }
  if (user) return <main className="account-page"><section className="account-card"><p className="eyebrow">YOUR EDITION</p><h1>{user.displayName}</h1><p>{user.email}</p><div className="account-grid"><a href="/search">Search the archive</a><a href="/global">Global Wire</a><a href="/">Front page</a><button onClick={logout}>Log out</button></div></section></main>;
  return <main className="auth-page"><div className="auth-card"><p className="eyebrow">[NEWS BRAND NAME] / ACCOUNT</p><h1>{mode === 'login' ? 'Welcome back.' : 'Join the newsroom.'}</h1><p className="auth-intro">Save stories, build your reading history, follow topics and get the news that matters to you.</p><form onSubmit={submit}>{mode === 'signup' && <label>Name<input required value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>}<label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label><label>Password<input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="auth-submit" disabled={busy}>{busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form><button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>{mode === 'login' ? 'New here? Create an account →' : 'Already have an account? Sign in →'}</button></div></main>;
}
