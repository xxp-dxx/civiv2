# Implementation Plan

Status is based on source inspection and GitHub Actions run [39029040482](https://github.com/xxp-dxx/civiv2/actions/runs/39029040482), where `npm test` passed on Node.js 20 and 22.

## Milestone 0 — Repository and technical foundation

**Status: substantially complete for the current prototype; hosting decisions remain open.**

Existing: Node.js 20+ requirement, dependency-free scripts, modular server/simulation/store split, a state version check, and a test suite. This session adds the missing architecture/product/data/handoff documents and a GitHub Actions test workflow.

Acceptance criteria met for this scope:
- A fresh checkout has instructions to run tests and start the API.
- Agent instructions explain architecture boundaries and handoff rules.
- Product scope, data model, architecture, milestones, current state, and limitations are documented.
- Automated tests run on Node.js 20 and 22 in CI.
- No secrets or unverified hosting claims were introduced.

Remaining before production: choose and verify hosting/storage, add migrations and recovery operations, and establish monitoring/backup procedures.

## Milestone 1 — Shared persistent world

**Status: partial prototype.**

Implemented in current source: anonymous player join, bearer tokens, a shared saved state, server-derived command identity, and a filtered state view.

Remaining: browser client, real accounts, explicit role/permission model, rate limiting, stronger validation/hardening, two-client manual verification, and a durable production storage strategy.

Acceptance criteria: two independent clients share consistent authorized state; invalid/unauthorized commands are rejected; reloads do not erase the world; private fields are absent from unauthorized API responses.

## Milestone 2 — Clock, events, and movement

**Status: partial prototype.**

Implemented: configurable real/world-time conversion, scheduled travel arrival, direct routes, command idempotency, lazy event catch-up on state/command requests, and save/load support for an in-progress journey.

Remaining: clock/config validation, broader scheduling tests, route planning, movement modes/terrain effects, operational recovery, and verification under a real service restart.

Acceptance criteria: accepted actions use authoritative time; journeys complete only when due; duplicate commands cannot create duplicate journeys; reload/restart does not reset in-progress travel.

## Milestone 3 — Citizens and economic loop

**Status: not started.**

Implement a bounded settlement loop: citizen cohorts, food and a small resource set, labor, one or two building recipes, consumption, construction duration, inventories, and explanatory reports.

Acceptance criteria: a settlement produces and consumes goods under constraints; missing inputs stop production; changes persist; shortages and resource deltas are explainable.

## Milestone 4 — Geography and logistics

**Status: basic placeholders only.**

The current map is a small hand-authored graph; realistic terrain, elevation, rivers, resource deposits, cargo, and regional storage are not implemented.

## Milestone 5 — Information asymmetry

**Status: minimal visibility projection only.**

Expand typed knowledge/observation records, delayed messages and rumors, and tests proving private fields never appear in unauthorized responses.

## Milestone 6 — Diplomacy and warfare

**Status: not started.**

Add treaty states, relations, declarations, supplies, army travel, server-resolved combat, reports, and explicit visibility policy.

## Milestone 7 — Environmental engineering

**Status: not started.**

Introduce a fixed component library and declarative schematic validation before machine manufacturing, mechanical power, water flow, or wind power.

## Milestone 8 — Depth and polish

**Status: not started.**

Expand NPC decisions, markets, technology, environmental events, interface usability, balance simulations, and operational monitoring after the earlier milestones pass their acceptance criteria.

## Next bounded task

Implement a minimal browser client for join, map view, travel, and journey status without moving authoritative simulation logic into the client. Acceptance criteria: a player can join and travel from the UI; refresh preserves session/journey state where the client stores its token; the server remains authoritative; and two independent clients see shared public map data without private journey details leaking.
