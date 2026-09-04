import "dotenv/config";
import { db } from "./index";
import {
  authors, categories, topics, tags, articles, articleAuthors,
  articleCategories, articleTopics, articleTags, articleBlocks,
  roles, permissions, newsletters
} from "./schema";

async function seed() {
  console.log("Seeding [NEWS BRAND NAME]...");

  const categoryData = [
    ["world", "World"], ["politics", "Politics"], ["business", "Business"],
    ["technology", "Technology"], ["science", "Science"], ["culture", "Culture"],
    ["sports", "Sports"], ["opinion", "Opinion"], ["data", "Data"]
  ] as const;

  const categoryRows = await db.insert(categories).values(
    categoryData.map(([slug, name]) => ({ slug, name }))
  ).onConflictDoNothing().returning();

  const topicData = [
    ["artificial-intelligence", "Artificial Intelligence", "The technologies, companies and policy decisions shaping AI."],
    ["climate-transition", "Climate Transition", "The economics and science of a changing climate."],
    ["future-of-work", "Future of Work", "How technology and economic change are reshaping work."]
  ] as const;

  const topicRows = await db.insert(topics).values(
    topicData.map(([slug, name, description]) => ({ slug, name, description }))
  ).onConflictDoNothing().returning();

  const tagData = ["AI", "Climate", "Policy", "Energy", "Startups", "Science", "Economy", "Cities"];
  const tagRows = await db.insert(tags).values(
    tagData.map(name => ({ slug: name.toLowerCase().replaceAll(" ", "-"), name }))
  ).onConflictDoNothing().returning();

  const authorRows = await db.insert(authors).values([
    {
      slug: "maya-sen", name: "Maya Sen",
      bio: "Technology correspondent covering artificial intelligence, platforms and the changing internet.",
      expertise: ["Artificial Intelligence", "Technology", "Policy"]
    },
    {
      slug: "daniel-okafor", name: "Daniel Okafor",
      bio: "Data journalist focused on cities, climate and public systems.",
      expertise: ["Data", "Climate", "Cities"]
    },
    {
      slug: "elena-martin", name: "Elena Martin",
      bio: "Senior writer exploring the intersection of economics, culture and technology.",
      expertise: ["Economy", "Culture", "Technology"]
    }
  ]).onConflictDoNothing().returning();

  const articleRows = await db.insert(articles).values([
    {
      slug: "cities-prepare-for-ai-powered-public-services",
      title: "Cities prepare for an AI-powered generation of public services",
      subtitle: "Local governments are moving from experiments to infrastructure, raising new questions about transparency and trust.",
      status: "PUBLISHED", kind: "MAJOR",
      publishedAt: new Date("2026-09-03T13:00:00Z"),
      seoTitle: "Cities prepare for an AI-powered generation of public services",
      seoDescription: "How cities are approaching artificial intelligence in public services."
    },
    {
      slug: "the-new-energy-map-is-taking-shape",
      title: "The new energy map is taking shape",
      subtitle: "Investment, transmission and storage are redrawing the geography of power.",
      status: "PUBLISHED", kind: "DATA",
      publishedAt: new Date("2026-09-03T09:30:00Z")
    },
    {
      slug: "why-the-next-ai-race-is-about-infrastructure",
      title: "Why the next AI race is about infrastructure",
      subtitle: "The contest is shifting from models alone to chips, electricity, networks and the places that can support them.",
      status: "PUBLISHED", kind: "EXPLAINER",
      publishedAt: new Date("2026-09-02T16:15:00Z")
    },
    {
      slug: "morning-brief-september-four",
      title: "Morning Brief: the stories to watch today",
      subtitle: "A concise guide to the developments shaping the day ahead.",
      status: "SCHEDULED", kind: "BRIEF",
      scheduledAt: new Date("2026-09-04T04:30:00Z")
    },
    {
      slug: "the-quiet-economics-of-smaller-cities",
      title: "The quiet economics of smaller cities",
      subtitle: "A new generation of companies is finding opportunity beyond the biggest metropolitan centers.",
      status: "DRAFT", kind: "STANDARD"
    }
  ]).returning();

  if (authorRows[0] && categoryRows[0] && topicRows[0] && tagRows[0] && articleRows[0]) {
    await db.insert(articleAuthors).values(articleRows.slice(0, 3).map((a, i) => ({
      articleId: a.id, authorId: authorRows[i % authorRows.length]!.id
    }))).onConflictDoNothing();

    await db.insert(articleCategories).values(articleRows.slice(0, 3).map((a, i) => ({
      articleId: a.id, categoryId: categoryRows[i % categoryRows.length]!.id
    }))).onConflictDoNothing();

    await db.insert(articleTopics).values(articleRows.slice(0, 3).map((a, i) => ({
      articleId: a.id, topicId: topicRows[i % topicRows.length]!.id
    }))).onConflictDoNothing();

    await db.insert(articleTags).values(articleRows.slice(0, 3).map((a, i) => ({
      articleId: a.id, tagId: tagRows[i % tagRows.length]!.id
    }))).onConflictDoNothing();

    await db.insert(articleBlocks).values([
      {
        articleId: articleRows[0].id, type: "paragraph", position: 0,
        data: { text: "Across a growing number of cities, artificial intelligence is moving from pilot projects into the systems residents encounter every day." }
      },
      {
        articleId: articleRows[0].id, type: "statistic", position: 1,
        data: { value: "37%", label: "of surveyed city technology offices report active AI procurement programs", source: "Demo Civic Technology Survey, 2026" }
      },
      {
        articleId: articleRows[0].id, type: "paragraph", position: 2,
        data: { text: "The central challenge is no longer whether the technology can be deployed, but whether residents can understand and challenge the decisions it helps produce." }
      }
    ]).onConflictDoNothing();
  }

  await db.insert(roles).values([
    { name: "SUPER_ADMIN" }, { name: "MANAGING_EDITOR" }, { name: "EDITOR" },
    { name: "JOURNALIST" }, { name: "COPY_EDITOR" }, { name: "PHOTOGRAPHER" },
    { name: "MODERATOR" }, { name: "ANALYST" }
  ]).onConflictDoNothing();

  await db.insert(permissions).values([
    "article:create", "article:edit", "article:publish", "article:schedule",
    "article:archive", "media:manage", "users:manage", "comments:moderate",
    "analytics:view", "settings:manage"
  ].map(key => ({ key }))).onConflictDoNothing();

  await db.insert(newsletters).values([
    { slug: "morning-brief", name: "Morning Brief", description: "The essential stories to start the day." },
    { slug: "evening-brief", name: "Evening Brief", description: "The day's most important developments, explained." },
    { slug: "tech-brief", name: "Tech Brief", description: "Technology, AI and the systems changing the world." },
    { slug: "business-brief", name: "Business Brief", description: "Markets, companies and the forces shaping the economy." }
  ]).onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
