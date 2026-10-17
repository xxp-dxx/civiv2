# Game Design

## Product vision

Build a persistent, real-time, multiplayer civilization simulation in which the world continues evolving when individual players disconnect. Players may act as members of factions or as independent citizens, and the economy should support personal property and businesses as well as public assets.

Stories should emerge from interacting systems—geography, production, logistics, information, diplomacy, and individual decisions—rather than scripted outcomes.

## Design pillars

1. Persistent world state that survives browser closure, reloads, and service restarts.
2. Time-dependent travel, construction, production, communication, and military operations.
3. Player agency bounded by server-validated rules, permissions, resources, and duration.
4. Information asymmetry: characters know what they observe or learn, not the whole world state.
5. An emergent economy constrained by resources, labor, geography, transport, and demand.
6. Player-designed engineering objects represented by validated declarative schematics, never arbitrary server-executed code.
7. Explainable outcomes for production, shortages, travel, combat, and economic changes.
8. Modular, tested, documented systems that can be maintained across coding sessions.

## Current prototype scope

The current codebase is a technical foundation, not yet the full gameplay loop. It contains three named locations and two direct routes, anonymous player creation, bearer-token authentication, a configurable world clock, scheduled travel arrival, JSON persistence, and server-side visibility filtering.

The first playable vertical slice should keep these systems understandable and add a minimal browser interface before adding a large collection of incomplete screens. The next interface should let a player join, see the public map, travel, and observe their own journey status. Economy and population systems should be added only after the world and action lifecycle are stable.

## MVP boundaries

For the initial implementation:

- The server owns authoritative state and all accepted commands.
- The browser is a presentation and command client, never an authority.
- Routine NPC behavior should use deterministic rules or utility scoring rather than requiring one AI inference per citizen.
- Player-authored engineering definitions are data validated by a controlled engine; uploaded executable code is out of scope.
- The prototype should be runnable locally without third-party service credentials.
- Free hosting, infinite uptime, or unlimited model usage must not be assumed.

## Decisions still open

Do not silently hard-code long-term answers to the following:

- Historical, fictional, or open-ended technological progression.
- World map scale, supported concurrent players, and NPC population.
- Real-time-to-world-time conversion and travel/construction speeds.
- One world versus multiple worlds or scenarios.
- Faction formation, membership, leadership succession, taxes, and property law.
- Currency, market mechanics, and the degree of autonomous NPC trade.
- Engineering editor depth and component library.
- Communication reach and delay at each technology level.
- Hosting provider, database, quota ceiling, and deployment process.
- Moderation, griefing prevention, naming rules, and administrative controls.

Temporary prototype values belong in configuration or explicit design notes and should be changed only with tests and documentation.
