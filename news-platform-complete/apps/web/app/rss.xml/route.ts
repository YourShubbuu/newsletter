import {NextResponse} from 'next/server';
export async function GET(){
  const api=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000';
  const data=await (await fetch(`${api}/public/articles?limit=30`,{cache:'no-store'})).json();
  const base=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';
  const items=(data.articles||[]).map((a:any)=>`<item><title><![CDATA[${a.headline}]]></title><link>${base}/story/${a.slug}</link><guid>${base}/story/${a.slug}</guid><pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate><description><![CDATA[${a.deck||''}]]></description></item>`).join('');
  return new NextResponse(`<?xml version="1.0"?><rss version="2.0"><channel><title>[NEWS BRAND NAME]</title><link>${base}</link><description>Independent journalism.</description>${items}</channel></rss>`,{headers:{'Content-Type':'application/rss+xml; charset=utf-8'}});
}
