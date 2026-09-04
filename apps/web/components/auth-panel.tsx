'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function apiBase() {
  const value = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  return value ? (value.endsWith('/api') ? value : `${value}/api`) : 'http://localhost:4000/api';
}

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch(`${apiBase()}/auth/${mode}`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ email, password, ...(mode === 'signup' ? { displayName: name } : {}) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Authentication failed');
      router.push('/account'); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed'); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <div className="auth-card">
      <p className="eyebrow">[NEWS BRAND NAME] / ACCOUNT</p>
      <h1>{mode === 'login' ? 'Welcome back.' : 'Join the newsroom.'}</h1>
      <p className="auth-intro">Save stories, build your reading history, follow topics and get the news that matters to you.</p>
      <form onSubmit={submit}>
        {mode === 'signup' && <label>Name<input required value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>}
        <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
        <label>Password<input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={busy}>{busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
        {mode === 'login' ? 'New here? Create an account →' : 'Already have an account? Sign in →'}
      </button>
    </div>
  </main>;
}
