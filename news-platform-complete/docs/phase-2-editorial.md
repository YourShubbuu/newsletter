# Phase 2: Editorial newsroom

Phase 2 turns the foundation into a working editorial loop: authenticated newsroom access, RBAC enforcement, article CRUD, block editing, autosave revisions, audit events, and guarded workflow transitions.

## Development login

Set `ALLOW_DEV_AUTH=true` only in local development. The `/auth/dev-session` route creates an 8-hour HTTP-only session for a seeded user by email. It is intentionally not a production authentication mechanism.

Production should replace this route with an OIDC/passkey/magic-link provider while preserving the `AuthServiceImpl` contract and permission checks.

## Workflow

`DRAFT → IN_REVIEW → COPY_EDIT → APPROVED → SCHEDULED → PUBLISHED`

Published stories can move to `UPDATED` or `ARCHIVED`; archived stories can be restored to `DRAFT`.

Every save creates an immutable article revision and audit record. Workflow transitions also emit an article event and audit record.
