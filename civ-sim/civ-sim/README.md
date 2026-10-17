# Persistent Civilization Simulation

A dependency-free Node.js prototype for a persistent civilization simulation. The current implementation is an API-only foundation for world state, player tokens, a configurable simulation clock, scheduled travel completion, and visibility-filtered state.

This is not yet a complete game and does not currently include a browser UI, economy, factions, combat, or deployment configuration.

## Requirements

- Node.js 20 or later
- No third-party npm dependencies

## Run locally

From this directory:

```sh
npm test
npm start
```

The HTTP API listens on port 3000 by default. Set `PORT` to change it and `STATE_PATH` to change the JSON save path. The default save path is `./data/world.json`, relative to the process working directory.

There is currently no frontend; use an API client, curl, or browser developer tools to interact with the simulation.

## API outline

- `GET /time` — returns calculated world time; does not itself process due events.
- `POST /join` — creates an anonymous player. Supply JSON such as `{"name":"Ada"}`. The bearer token is returned once and must be stored by the client.
- `GET /state` — requires `Authorization: Bearer <token>`; processes due events and returns the caller's authorized view.
- `POST /commands` — requires bearer authentication. The currently supported command is travel, for example `{"id":"travel-1","type":"travel","toLocationId":"hillford"}`.

The default map contains Riverton, Hillford, and Port Saltmarsh. Travel requires a direct route from the player's current location. Commands are scoped to the authenticated player; a body-supplied player ID is not authoritative.

## Persistence and deployment caveats

The authoritative state is stored in a JSON file. Writes use a temporary file followed by rename, but this is not a substitute for database transactions, concurrent multi-process coordination, backups, or operational monitoring. The current design assumes a single application process and a persistent writable filesystem. Hosting suitability has not yet been evaluated.

## Project documents

- `persistent_civilization_ai_master_spec.md` — full product and implementation specification
- `GAME_DESIGN.md` — design pillars, prototype scope, and unresolved decisions
- `ARCHITECTURE.md` — current architecture and target boundaries
- `DATA_MODEL.md` — persisted state schema and invariants
- `IMPLEMENTATION_PLAN.md` — milestones, status, and acceptance criteria
- `CURRENT_STATE.md` — verified status and next handoff
- `docs/systems/` — focused system notes
- `docs/ui/` — current UI status and intended interaction model
