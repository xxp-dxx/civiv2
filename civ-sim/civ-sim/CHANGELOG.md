# Changelog

## Unreleased — Session 1, technical foundation

- Added project README and documented the existing API, startup, state path, and known deployment limits.
- Added game design, architecture, data model, and milestone planning documents.
- Added focused notes on simulation clock/events, persistence, visibility/security, and UI status.
- Updated agent instructions and the current-state handoff to reflect the actual repository instead of incorrectly describing it as empty.
- Added a GitHub Actions workflow for the existing Node.js test suite.
- No simulation rules or runtime behavior were changed.

## 0.1.0

- Added simulation core (clock, scheduled events, idempotent travel command, visibility-filtered view), JSON-file persistence, token-auth HTTP API, and tests.
