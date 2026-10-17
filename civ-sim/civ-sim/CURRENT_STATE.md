# Current State

**Updated:** 2026-10-17  
**Working branch:** `session-1/milestone-0-foundation`

## Repository inspection

The application lives at `civ-sim/civ-sim/` inside the `xxp-dxx/civiv2` repository. It is not an empty repository. The existing project uses Node.js 20+ and the built-in HTTP, crypto, filesystem, and test modules; it has no third-party dependencies.

Files inspected in the starting revision:
- `src/server.js`: HTTP API, join flow, bearer auth, request parsing, persistence coordination.
- `src/sim.js`: version-1 world state, three map locations, two direct routes, clock, travel events, command idempotency, visibility projection.
- `src/store.js`: JSON persistence using temp-file write and rename, plus schema-version check.
- `test/sim.test.js`: tests for clock, travel, idempotency, invalid commands, save/load, repeated event processing, visibility, and HTTP auth.
- `package.json`: `npm start` and `npm test`, requiring Node >=20.
- `persistent_civilization_ai_master_spec.md`: master requirements.
- `AGENTS.md` and the prior state/changelog notes.

## Architecture assessment

The existing architecture supports a **single-process persistent API prototype**, not yet production-grade multiplayer hosting. Authoritative command execution and visibility filtering are server-side, and journeys are represented as scheduled events. State is a local JSON file; no database, cross-process locking, browser client, multi-account identity system, explicit faction permissions, request rate limits, or deployment configuration is present.

The single-process assumption and the current local-file storage strategy must be preserved as explicit prototype constraints. Hosting quotas, availability, and deployment costs remain unverified because no provider is configured.

## Test and build status

The test suite and test command exist. This session could not clone the public repository through the execution environment because outbound DNS/network access to GitHub was unavailable. Therefore, no fresh local `npm test` result or build result is claimed. A GitHub Actions workflow has been added to execute the existing suite on Node.js 20 and 22; its result must be checked after this branch is pushed.

There is no separate build or lint script in the current `package.json`.

## Work in this session

- Corrected the initial repository assessment: the codebase already has a small working implementation.
- Documented product scope, current architecture, data schema, milestones, persistence, clock/events, visibility/security, and UI status.
- Added automated test workflow configuration.
- Did not alter simulation rules or claim new runtime features.

## Known gaps

- No browser UI; the API must currently be driven with an HTTP client.
- No real accounts, session expiry, token rotation, or rate limiting.
- JSON file storage has no database transactions, backup mechanism, or multi-process safety.
- No schema migration implementation.
- Only direct travel routes and a single travel command exist.
- No economy, citizens, factions, diplomacy, warfare, environmental model, or engineering editor.
- The route `GET /time` calculates time but does not process due events; event catch-up happens on authenticated state/command flows.
- No hosting provider or deployment configuration has been selected.

## Next task

Check the CI run for this branch and fix failures before implementing anything new. If CI passes, create the first static browser client for join, map display, travel command submission, and the player's own journey status. Acceptance criteria: a player can join and travel from the UI; refresh preserves session/journey state where the client stores its token; the server remains authoritative; and two separate clients see shared public map data without private journey details leaking.
