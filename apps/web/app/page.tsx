const stories = [
  { label: "WORLD", title: "Cities prepare for an AI-powered generation of public services", meta: "8 MIN READ" },
  { label: "DATA", title: "The new energy map is taking shape", meta: "6 MIN READ" },
  { label: "EXPLAINER", title: "Why the next AI race is about infrastructure", meta: "9 MIN READ" },
];

export default function HomePage() {
  return (
    <main>
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", gap: 24 }}>
          <strong style={{ fontFamily: "Georgia, serif", fontSize: 24 }}>[NEWS BRAND NAME]</strong>
          <nav style={{ display: "flex", gap: 20, fontSize: 12, letterSpacing: ".08em" }}>
            <span>LIVE</span><span>WORLD</span><span>BUSINESS</span><span>TECHNOLOGY</span><span>SCIENCE</span><span>CULTURE</span>
          </nav>
          <span style={{ fontSize: 12 }}>04 SEP 2026</span>
        </div>
      </header>

      <section style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--live)", letterSpacing: ".12em", marginBottom: 24 }}>
          ● DEVELOPING / THE LIVE EDITION
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.8fr) minmax(280px, .7fr)", gap: 1, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <article style={{ padding: "42px 32px 54px 0", borderRight: "1px solid var(--line)" }}>
            <p style={{ fontSize: 11, letterSpacing: ".14em", color: "var(--accent)" }}>MAJOR STORY</p>
            <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "clamp(44px, 7vw, 92px)", lineHeight: .93, letterSpacing: "-.045em", maxWidth: 1000 }}>
              Cities prepare for an AI-powered generation of public services
            </h1>
            <p style={{ maxWidth: 650, fontSize: 19, lineHeight: 1.55, color: "var(--muted)" }}>
              Local governments are moving from experiments to infrastructure, raising new questions about transparency and trust.
            </p>
            <div style={{ marginTop: 32, fontFamily: "ui-monospace, monospace", fontSize: 11 }}>MAYA SEN · UPDATED 18 MIN AGO · 8 MIN READ</div>
          </article>

          <aside>
            {stories.slice(1).map((story) => (
              <article key={story.title} style={{ padding: 28, borderBottom: "1px solid var(--line)" }}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: "var(--muted)" }}>{story.label}</div>
                <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 28, lineHeight: 1.05 }}>{story.title}</h2>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: "var(--muted)" }}>{story.meta}</div>
              </article>
            ))}
          </aside>
        </div>

        <section style={{ padding: "50px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
            <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontWeight: 400 }}>What’s happening now</h2>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10 }}>NOW · 15M · 1H · 3H · TODAY</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--line)", marginTop: 1 }}>
            {["NOW", "1 HOUR AGO", "TODAY"].map((time, i) => (
              <div key={time} style={{ background: "var(--background)", padding: 24, minHeight: 150 }}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: "var(--muted)" }}>{time}</div>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 22 }}>
                  {["A new development enters the live desk.", "Policy makers respond to the morning's news.", "The day's major threads begin to connect."][i]}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
