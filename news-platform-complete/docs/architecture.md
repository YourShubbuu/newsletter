# Architecture Notes

## Modular monolith

The API is organized by domain boundaries rather than deployed microservices. This keeps transactions, migrations and local development simple while preserving clear seams for future extraction.

## Content model

Articles contain ordered typed blocks. Block payloads are JSON but must be validated by a discriminated schema before persistence. This permits rich editorial composition without coupling every article layout to application code.

## Realtime

Phase 4 will publish domain events after successful editorial transactions. Redis will fan those events to an SSE gateway. Clients subscribe only to public channels.

## Search

PostgreSQL full-text search is the initial search implementation. OpenSearch is a future scaling option, not a Phase 1 dependency.

## Privacy

Reading history and analytics are separate concepts. User history is authenticated and user-controlled. Aggregate analytics should minimize identifiers and enforce retention limits.

## Cache boundaries

Only public, non-personalized content is eligible for shared caching. Authenticated responses must not be placed in public edge caches.
