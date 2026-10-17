# Security and Information Visibility

## Current protections

- `POST /join` generates a random bearer token and returns it once.
- The state stores a SHA-256 token hash rather than the raw bearer token.
- Protected routes derive the acting player from the bearer token; request-body player IDs are not authoritative.
- The simulation builds a per-player response using `viewFor`.
- The public view includes map locations/routes and other players' names, but not their exact locations, journey data, token hashes, or the internal event log.
- Request JSON bodies are limited to 10,000 characters.

## Known gaps

There is no rate limiting, session expiry, token revocation/rotation, real account provider, moderation, comprehensive input schema, origin policy, or multi-process protection. Anonymous join is unrestricted, and the prototype has not been penetration-tested. Do not expose it publicly without a separate deployment/security review.

## Rules for new systems

Every field must have an explicit visibility rule. Distinguish public geography from private activity. Filter unauthorized information in the server projection before serialization; hiding it only in the UI is insufficient.

Tests should inspect serialized responses for the absence of restricted fields and should attempt unauthorized reads of private inventories, building details, military positions, diplomatic plans, and command queues as those systems are added. Knowledge should eventually be represented as observations/reports with source, observation and receipt times, confidence, and staleness, rather than inferred from global state.
