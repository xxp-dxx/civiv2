# Data Model

## Current persisted state

The current JSON state is a plain object written by `src/store.js`. Version 1 contains these top-level fields:

| Field | Meaning |
|---|---|
| `version` | Persisted-state schema version; currently 1. |
| `seed` | Reserved world seed value; not currently used by simulation randomness. |
| `seq` | Monotonic counter used to generate IDs/event sequence numbers. |
| `config` | Clock scale and walking speed, with prototype defaults. |
| `clock` | Real-time epoch and world-time epoch used to derive world time. |
| `locations` | Public map locations, currently with ID, name, and map coordinates. |
| `routes` | Direct links between locations with distance in kilometres. |
| `players` | Player ID, display name, token hash, location ID, and current journey ID. |
| `journeys` | Journey ID, owner, origin/destination, departure/arrival world times, and status. |
| `events` | Scheduled event records with due world time, sequence, type, and payload. |
| `commands` | Idempotency records keyed by player ID and client command ID, including stored outcome. |
| `log` | Internal event history, currently used for completed travel arrivals. |

IDs are generated within the in-memory state. Times ending in `S` are world seconds, while `realEpochMs` is wall-clock milliseconds. Distances are kilometres; `walkKmPerWorldHour` is kilometres per world hour.

## Invariants in the current prototype

- The server owns the state; callers cannot select another player as command actor.
- A player is either at a location or has an in-progress journey; during travel, `locationId` is null and `journeyId` is set.
- A completed journey changes the owner's location and clears the current journey pointer.
- A journey arrival is applied only while the journey is marked `in_progress`.
- Command IDs are unique per player for idempotent submission; a repeat returns the stored outcome.
- A client view is built through `viewFor`, not by serializing the raw state.
- The state version must match the version supported by the code; no migration path currently exists.

## Future entities (not implemented)

The product specification anticipates separate records for citizens/cohorts, factions, businesses, inventories, resource definitions, production recipes, buildings, contracts, cargo, regions, environmental data, knowledge/rumors, diplomatic relations, military units, technology, and declarative engineering schematics. These are design targets, not fields currently present in version 1.

When adding data, specify units, valid ranges, ownership, visibility, persistence and migration behavior. Avoid storing derived values when they can be calculated safely and consistently. A future schema change must include a migration or an explicit documented recovery strategy before the new schema is released.
