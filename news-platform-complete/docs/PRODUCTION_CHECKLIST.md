# Production launch checklist

- Infrastructure: PostgreSQL backups/PITR, Redis strategy, object storage, CDN/WAF, TLS/HSTS, secrets manager.
- Identity: OIDC/passkeys, MFA for privileged roles, session rotation/revocation, CSRF and CSP.
- Editorial: object-storage media adapter, preview links, durable scheduling worker, revision restore, corrections.
- Audience: transactional email, double opt-in, notification preferences, moderation queue, abuse controls.
- SEO: canonical URLs, OG images, Article JSON-LD, RSS, sitemap, robots, search-engine registration.
- Observability: errors, structured logs/request IDs, DB slow queries, synthetic checks, alerting.
- Privacy: policy, terms, consent, retention, account export/deletion.
- Accessibility: keyboard-only, focus management, screen-reader labels, 200% zoom, reduced motion.
- Performance: CDN caching, image optimization, route-level budgets, database indexes, load testing.
