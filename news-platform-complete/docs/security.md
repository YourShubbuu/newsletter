# Security Baseline

1. Authenticate at the server boundary.
2. Authorize every mutation on the server.
3. Validate request bodies, query params and route params.
4. Sanitize rich HTML and embeds.
5. Store secrets only in environment/secret managers.
6. Use secure session cookies.
7. Rate-limit authentication, comments, search and write-heavy endpoints.
8. Validate file MIME, extension, size and decoded content before storage.
9. Apply CSP and other security headers.
10. Record privileged mutations in `audit_logs`.
11. Do not expose private user history through public caching.
12. Add MFA support for privileged newsroom roles before production launch.
