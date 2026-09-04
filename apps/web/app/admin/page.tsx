import Link from "next/link";

export default function AdminHome() {
  return (
    <main className="admin-shell">
      <header className="admin-topbar"><strong>[NEWS BRAND NAME]</strong><span>NEWSROOM / ADMIN</span></header>
      <section className="admin-content">
        <div className="eyebrow">EDITORIAL DESK</div>
        <h1>Newsroom control room</h1>
        <p className="lede">Draft, review, schedule and publish without leaving the editorial surface.</p>
        <Link className="button" href="/admin/editor">Open article editor →</Link>
      </section>
    </main>
  );
}
