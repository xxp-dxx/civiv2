# CURRENT_STATE

## Initial inspection (spec section 18)
Repository was empty. No existing architecture, tests, or hosting constraints. Chosen stack (temporary, isolated behind `store.js`): dependency-free Node.js, JSON file persistence. Single-process assumption: request handlers are synchronous, so commands are applied one at a time.

## Verified (see `npm test`)
- Server-side clock (configurable scale); due events processed lazily on every request (works if the host sleeps).
- Travel command: validated at execution time, takes world time, idempotent per (player, command id), survives save/load.
- Visibility: other players' journeys/locations, token hashes, audit log absent from `/state`.
- Auth: bearer token (hash stored); body-supplied playerId ignored.

## Not done (honest scope)
- Milestone 0: GAME_DESIGN, ARCHITECTURE, DATA_MODEL, IMPLEMENTATION_PLAN, docs/ not written yet.
- Milestone 1: no browser client, no factions/permissions beyond "own state only", no rate limiting, no real accounts (join = new anonymous player).
- Milestones 3-8 (economy, geography, information, war, engineering) not started.
- Section 17 open decisions (scale, era, hosting, currency...) unresolved; defaults live in `config`.

## Next task
Static browser client (map of 3 locations, join, travel button, ETA countdown) polling `/state`; acceptance: two browser tabs see consistent world, reload keeps the session and journey. Then write the missing Milestone 0 docs.
