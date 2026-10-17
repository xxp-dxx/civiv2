'use strict';
// Authoritative simulation core. No HTTP, no disk, no UI. Pure functions over a plain-JSON state.
const crypto = require('node:crypto');
const STATE_VERSION = 1;

function defaultMap() {
  const loc = (id, name, x, y) => [id, { id, name, x, y }];
  return {
    locations: Object.fromEntries([
      loc('riverton', 'Riverton', 0, 0), loc('hillford', 'Hillford', 20, 5), loc('saltmarsh', 'Port Saltmarsh', 35, -10),
    ]),
    routes: [
      { from: 'riverton', to: 'hillford', distanceKm: 20 },
      { from: 'hillford', to: 'saltmarsh', distanceKm: 25 },
    ],
  };
}

function createWorld({ nowMs, config = {}, seed = 1 }) {
  return {
    version: STATE_VERSION, seed, seq: 0,
    config: { worldSecondsPerRealSecond: 60, walkKmPerWorldHour: 5, ...config },
    clock: { realEpochMs: nowMs, worldEpochS: 0 },
    ...defaultMap(),
    players: {}, journeys: {}, events: [], commands: {}, log: [],
  };
}

// Server clock only: client clocks are never consulted.
const worldTimeS = (s, nowMs) =>
  s.clock.worldEpochS + ((nowMs - s.clock.realEpochMs) / 1000) * s.config.worldSecondsPerRealSecond;

const nextId = (s, prefix) => `${prefix}${++s.seq}`;
const hashToken = (t) => crypto.createHash('sha256').update(String(t)).digest('hex');

function schedule(s, atS, type, data) {
  s.events.push({ seq: ++s.seq, atS, type, ...data });
}

function addPlayer(s, { name, tokenHash, startLocationId = 'riverton' }) {
  const clean = typeof name === 'string' ? name.trim() : '';
  if (clean.length < 1 || clean.length > 32) return { ok: false, error: 'invalid_name' };
  if (!s.locations[startLocationId]) return { ok: false, error: 'unknown_location' };
  const id = nextId(s, 'p');
  s.players[id] = { id, name: clean, tokenHash, locationId: startLocationId, journeyId: null };
  return { ok: true, playerId: id };
}

function authenticate(s, token) {
  if (typeof token !== 'string' || !token) return null;
  const h = Buffer.from(hashToken(token));
  for (const p of Object.values(s.players)) {
    const ph = Buffer.from(p.tokenHash);
    if (ph.length === h.length && crypto.timingSafeEqual(ph, h)) return p.id;
  }
  return null;
}

// Process all events that are due, in deterministic (time, seq) order. Safe to call repeatedly.
function advance(s, nowMs) {
  const nowS = worldTimeS(s, nowMs);
  s.events.sort((a, b) => a.atS - b.atS || a.seq - b.seq);
  while (s.events.length && s.events[0].atS <= nowS) applyEvent(s, s.events.shift());
  return nowS;
}

function applyEvent(s, ev) {
  if (ev.type !== 'arrive') return;
  const j = s.journeys[ev.journeyId];
  if (!j || j.status !== 'in_progress') return; // already resolved: no double-apply
  j.status = 'completed';
  const p = s.players[j.ownerId];
  p.locationId = j.toId; p.journeyId = null;
  s.log.push({ atS: ev.atS, type: 'arrived', journeyId: j.id, playerId: p.id });
}

const findRoute = (s, a, b) =>
  s.routes.find((r) => (r.from === a && r.to === b) || (r.from === b && r.to === a));

// actorId comes from authentication, never from the request body.
function submitCommand(s, actorId, cmd, nowMs) {
  const nowS = advance(s, nowMs);
  if (!cmd || typeof cmd.id !== 'string' || !cmd.id || cmd.id.length > 64) return { ok: false, error: 'invalid_command_id' };
  const key = `${actorId}:${cmd.id}`;
  if (s.commands[key]) return { ...s.commands[key].outcome, duplicate: true }; // idempotent: no double charge
  const outcome = execute(s, actorId, cmd, nowS);
  s.commands[key] = { type: cmd.type, acceptedAtS: nowS, outcome };
  return outcome;
}

function execute(s, actorId, cmd, nowS) {
  const p = s.players[actorId];
  if (!p) return { ok: false, error: 'unknown_player' };
  if (cmd.type !== 'travel') return { ok: false, error: 'unsupported_command' };
  if (p.journeyId) return { ok: false, error: 'already_travelling' };
  const route = findRoute(s, p.locationId, cmd.toLocationId);
  if (!route) return { ok: false, error: 'no_route' };
  const durationS = (route.distanceKm / s.config.walkKmPerWorldHour) * 3600;
  const j = { id: nextId(s, 'j'), ownerId: p.id, fromId: p.locationId, toId: cmd.toLocationId,
    departS: nowS, arriveS: nowS + durationS, status: 'in_progress' };
  s.journeys[j.id] = j;
  p.locationId = null; p.journeyId = j.id; // in transit: not at any location
  schedule(s, j.arriveS, 'arrive', { journeyId: j.id });
  return { ok: true, journeyId: j.id, arriveS: j.arriveS };
}

// Visibility policy (explicit, per field): public geography, your own state and journeys,
// other players' names only. Positions/journeys of others, token hashes and the audit log are never sent.
function viewFor(s, playerId, nowMs) {
  const me = s.players[playerId];
  return {
    worldTimeS: worldTimeS(s, nowMs),
    you: { id: me.id, name: me.name, locationId: me.locationId, journeyId: me.journeyId },
    journeys: Object.values(s.journeys).filter((j) => j.ownerId === playerId),
    locations: Object.values(s.locations), routes: s.routes,
    players: Object.values(s.players).filter((p) => p.id !== playerId).map((p) => ({ id: p.id, name: p.name })),
  };
}

module.exports = { STATE_VERSION, createWorld, worldTimeS, addPlayer, authenticate, hashToken, advance, submitCommand, viewFor };
