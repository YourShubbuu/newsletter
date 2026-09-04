import Link from 'next/link';

const sectionNames: Record<string, string> = {
  live: 'Live', world: 'World', business: 'Business', technology: 'Technology', science: 'Science', culture: 'Culture',
};

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const name = sectionNames[section.toLowerCase()] ?? section;
  return (
    <main className="section-page">
      <p className="eyebrow">SECTION</p>
      <h1>{name}</h1>
      <p className="section-intro">The latest reporting, explainers, and analysis from {name.toLowerCase()}.</p>
      <div className="empty-editorial-state">
        <strong>Stories are ready to arrive here.</strong>
        <span>Publish an article in the editorial desk and it will appear in this section.</span>
        <Link href="/">Return to the front page</Link>
      </div>
    </main>
  );
}
