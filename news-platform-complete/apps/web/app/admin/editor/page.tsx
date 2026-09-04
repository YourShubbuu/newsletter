"use client";

import { useEffect, useMemo, useState } from "react";

type Block = { id?: string; type: "paragraph" | "heading" | "quote"; data: { text: string } };
type Article = { id: string; title: string; subtitle: string | null; status: string; kind: string };
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function EditorPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([{ type: "paragraph", data: { text: "Start writing…" } }]);
  const [message, setMessage] = useState("Not saved yet");
  const [devEmail, setDevEmail] = useState("editor@news.local");

  async function call(path: string, init?: RequestInit) {
    const res = await fetch(`${API}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function signIn() { await call("/auth/dev-session", { method: "POST", body: JSON.stringify({ email: devEmail }) }); await loadArticles(); setMessage("Signed in"); }
  async function loadArticles() { const data = await call("/articles"); setArticles(data); if (!article && data[0]) await openArticle(data[0].id); }
  async function openArticle(id: string) { const data = await call(`/articles/${id}`); setArticle(data.article); setBlocks(data.blocks.map((b: any) => ({ id: b.id, type: b.type, data: b.data }))); setMessage("Loaded"); }
  async function createArticle() { const data = await call("/articles", { method: "POST", body: JSON.stringify({ title: "Untitled story", kind: "STANDARD" }) }); setArticles((items) => [data.article, ...items]); setArticle(data.article); setBlocks(data.blocks); setMessage("Draft created"); }
  async function save() { if (!article) return; setMessage("Saving…"); const data = await call(`/articles/${article.id}`, { method: "PATCH", body: JSON.stringify({ title: article.title, subtitle: article.subtitle, kind: article.kind, blocks }) }); setArticle(data.article); setBlocks(data.blocks); setMessage(`Saved revision ${new Date().toLocaleTimeString()}`); }
  async function transition(to: string) { if (!article) return; const data = await call(`/articles/${article.id}/transition`, { method: "POST", body: JSON.stringify({ to }) }); setArticle(data.article); setArticles((items) => items.map((a) => a.id === article.id ? data.article : a)); setMessage(`Workflow: ${to}`); }

  useEffect(() => { loadArticles().catch(() => setMessage("Sign in to access the newsroom")); }, []);
  useEffect(() => { if (!article) return; const timer = setTimeout(() => save().catch(() => setMessage("Autosave failed")), 1800); return () => clearTimeout(timer); }, [article?.title, article?.subtitle, JSON.stringify(blocks)]);

  const nextActions = useMemo(() => ({ DRAFT: ["IN_REVIEW"], IN_REVIEW: ["COPY_EDIT"], COPY_EDIT: ["APPROVED"], APPROVED: ["SCHEDULED", "PUBLISHED"], SCHEDULED: ["PUBLISHED"], PUBLISHED: ["UPDATED", "ARCHIVED"], UPDATED: ["PUBLISHED", "ARCHIVED"], ARCHIVED: ["DRAFT"] }[article?.status ?? "DRAFT"] ?? []), [article?.status]);

  return <main className="editor-app">
    <aside className="editor-sidebar">
      <div className="sidebar-brand">NEWSROOM</div>
      <button className="button compact" onClick={signIn}>Dev sign-in</button>
      <button className="button secondary compact" onClick={createArticle}>+ New story</button>
      <div className="story-list">{articles.map((item) => <button key={item.id} className={`story-item ${article?.id === item.id ? "active" : ""}`} onClick={() => openArticle(item.id)}><strong>{item.title}</strong><span>{item.status}</span></button>)}</div>
    </aside>
    <section className="editor-main">
      <header className="editor-toolbar"><span className="status-dot" /> <span>{message}</span><div className="toolbar-actions">{nextActions.map((action) => <button key={action} onClick={() => transition(action)}>{action}</button>)}<button className="primary" onClick={save}>Save</button></div></header>
      {article ? <article className="canvas">
        <select value={article.kind} onChange={(e) => setArticle({ ...article, kind: e.target.value })}><option>STANDARD</option><option>MAJOR</option><option>BRIEF</option><option>EXPLAINER</option><option>DATA</option><option>OPINION</option></select>
        <input className="title-input" value={article.title} onChange={(e) => setArticle({ ...article, title: e.target.value })} placeholder="Headline" />
        <textarea className="subtitle-input" value={article.subtitle ?? ""} onChange={(e) => setArticle({ ...article, subtitle: e.target.value })} placeholder="Deck / standfirst" />
        <div className="blocks">{blocks.map((block, i) => <div className="block" key={block.id ?? i}><select value={block.type} onChange={(e) => setBlocks((items) => items.map((b, n) => n === i ? { ...b, type: e.target.value as Block["type"] } : b))}><option value="paragraph">Paragraph</option><option value="heading">Heading</option><option value="quote">Quote</option></select><textarea value={block.data.text} onChange={(e) => setBlocks((items) => items.map((b, n) => n === i ? { ...b, data: { text: e.target.value } } : b))} /><button className="remove" onClick={() => setBlocks((items) => items.filter((_, n) => n !== i))}>Remove</button></div>)}</div>
        <button className="add-block" onClick={() => setBlocks((items) => [...items, { type: "paragraph", data: { text: "" } }])}>+ Add block</button>
      </article> : <div className="empty">Sign in, then choose a story.</div>}
    </section>
  </main>;
}
