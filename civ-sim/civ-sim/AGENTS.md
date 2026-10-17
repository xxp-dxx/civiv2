# AGENTS.md
Read `CURRENT_STATE.md` first, then the spec (`persistent_civilization_ai_master_spec.md`).
- Run: `npm start` (needs Node >= 20, no dependencies). Test: `npm test`.
- Boundaries: `src/sim.js` = authoritative rules (pure, no I/O). `src/store.js` = persistence. `src/server.js` = HTTP + auth. UI must never mutate state directly.
- Rules: one bounded task per session; add tests with every rule; never claim untested behavior; never send hidden state to a client (filter in `viewFor`); update `CURRENT_STATE.md` + `CHANGELOG.md` at the end.
