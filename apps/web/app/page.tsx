import { ReaderHeader } from '@/components/reader-shell';
import { FrontInteractive } from './front-interactive';
function apiBase() { const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, ''); return configured ? (configured.endsWith('/api') ? configured : `${configured}/api`) : 'http://localhost:4000/api'; }
async function getStories() { try { const r = await fetch(`${apiBase()}/public/articles`, { next: { revalidate: 30 } }); return r.ok ? r.json() : []; } catch { return []; } }
async function getWire() { try { const r = await fetch(`${apiBase()}/global/wire?limit=12`, { next: { revalidate: 60 } }); return r.ok ? r.json() : []; } catch { return []; } }
export default async function HomePage() { const [stories, wire] = await Promise.all([getStories(), getWire()]); return <><ReaderHeader /><FrontInteractive stories={stories} wire={wire} /></>; }
