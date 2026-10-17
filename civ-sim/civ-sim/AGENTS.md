# Agent instructions

Read `CURRENT_STATE.md` first, then `persistent_civilization_ai_master_spec.md`, then the documents relevant to the task.

## Runtime and commands

- Work from `civ-sim/civ-sim/` (the project is intentionally left at its current nested path; do not relocate it as incidental cleanup).
- Requires Node.js 20 or later. The current prototype has no third-party dependencies.
- Run `npm test` for the Node built-in test suite and `npm start` to start the HTTP API.
- The GitHub Actions workflow runs the same test suite on supported Node versions.

## Architecture boundaries

- `src/sim.js`: authoritative simulation rules and visibility projection; no HTTP or disk I/O.
- `src/store.js`: JSON-file persistence and state-version validation.
- `src/server.js`: HTTP routing, bearer-token authentication, and coordination of simulation and persistence.
- `test/`: rule and integration tests. Add tests whenever behavior or invariants change.
- UI code must never mutate authoritative state directly. Hidden state must be filtered by the server before serialization.

## Required workflow

1. Inspect the current implementation and relevant documentation before editing.
2. Make one bounded change at a time. Preserve existing behavior unless a change is explicitly required and documented.
3. Run tests and relevant checks. Report checks that were not run and why; never describe unexecuted checks as passing.
4. Update `CURRENT_STATE.md`, `CHANGELOG.md`, and relevant system docs for material changes.
5. End each session with the next concrete task and observable acceptance criteria.
6. Never commit secrets or make hosting/cost promises without verified evidence.
