'use client';
import {useEffect,useState} from 'react';

function getApiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (configured) return configured.endsWith('/api') ? configured : `${configured}/api`;
  return process.env.NODE_ENV === 'development' ? 'http://localhost:4000/api' : '';
}

export default function SearchPage(){
  const[q,setQ]=useState(''); const[results,setResults]=useState<any[]>([]);
  useEffect(()=>{const id=setTimeout(async()=>{if(!q.trim()){setResults([]);return;}
    const api=getApiBase(); if(!api)return;
    const r=await fetch(`${api}/public/search?q=${encodeURIComponent(q)}`); if(r.ok)setResults((await r.json()).results||[]);
  },250);return()=>clearTimeout(id)},[q]);
  return <main className="search-page"><h1>Search</h1><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search stories, topics, authors…" aria-label="Search"/>
    <div>{results.map(r=><a className="search-result" key={r.id} href={`/story/${r.slug}`}><strong>{r.headline}</strong><span>{r.deck}</span></a>)}</div>
  </main>;
}
