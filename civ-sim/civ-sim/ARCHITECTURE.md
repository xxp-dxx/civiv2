# Architecture

## Current implementation

The project is a dependency-free Node.js HTTP API. Its current modules are deliberately small:

- `src/server.js` handles HTTP routes, join requests, bearer authentication, error responses, and coordination of simulation state and persistence.
- `src/sim.js` contains the authoritative world model, clock conversion, player creation, token hashing/authentication, scheduled event processing, the travel command, and the authorized state projection.
- `src/store.js` loads and saves versioned JSON state. Save writes use a temporary file and rename.
- `test/sim.test.js` covers clock conversion, travel timing, idempotency, invalid commands, save/load recovery, repeated event processing, visibility filtering, and an HTTP authentication workflow.

No frontend, database, migration framework, authentication provider, rate limiter, deployment manifest, or operational monitoring is present.

## Request and state flow

1. A client calls the HTTP API.
2. For protected routes, the server hashes the bearer token and matches it against stored token hashes.
3. The server advances due simulation events where applicable.
4. Commands execute against server-owned state using the authenticated player ID, not a player ID supplied in the body.
5. The resulting state is saved, and only the caller's permitted view is serialized.

The simulation core does not depend on UI components. Client inputs are requests, not authoritative results.

## Current API

| Route | Auth | Current behavior |
|---|---|---|
| `GET /time` | No | Computes world time; does not process due events or persist state. |
| `POST /join` | No | Creates an anonymous player and returns a random bearer token once. |
| `GET /state` | Bearer | Advances due events, persists the state, and returns a filtered view. |
| `POST /commands` | Bearer | Validates and applies a command, records its result, and persists state. |

The only implemented command type is `travel`. Direct route links are required.

## Persistence and process model

The JSON store validates a numeric schema version before returning loaded data. A version mismatch throws a migration-required error; migrations are not implemented yet. The file store assumes one active application process with a writable local filesystem. It does not provide cross-process locking or database transactions. The application currently processes scheduled events lazily on relevant requests, so no always-running timer is required for catch-up; actual host sleep behavior and writable-storage guarantees still depend on deployment.

## Security boundaries and limitations

Existing protections include server-side bearer authentication, storage of token hashes rather than raw tokens, constant-time token-hash comparison when lengths match, command identity derived from authentication, and a server-side `viewFor` projection that excludes other players' locations/journeys and internal token/audit fields.

Known gaps include no join or command rate limiting, no account recovery or token rotation, no session expiry, a 10,000-character request-body limit but no comprehensive API hardening, no multi-process coordination, and no adversarial load testing. Do not treat the prototype as internet-hardened.

## Target boundaries

Keep the simulation core independent of the hosting provider. Future systems should have explicit modules for world/clock, commands, population, economy, logistics, factions, diplomacy, military, knowledge, environment, engineering, persistence, API, UI, and tests. Introduce these only when there is a working vertical slice and specific acceptance criteria. Avoid replacing the existing stack solely to match a target diagram.
