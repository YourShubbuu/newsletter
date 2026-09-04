import { ReaderHeader } from '@/components/reader-shell';
import { FrontInteractive } from './front-interactive';

async function getStories() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  const api = configured ? (configured.endsWith('/api') ? configured : `${configured}/api`) : 'http://localhost:4000/api';
  try {
    const response = await fetch(`${api}/public/articles`, { next: { revalidate: 30 } });
    if (!response.ok) return [];
    return response.json();
  } catch { return []; }
}

export default async function HomePage() {
  const stories = await getStories();
  return <><ReaderHeader /><FrontInteractive stories={stories} /></>;
}
