'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const sim = require('../src/sim');
const store = require('../src/store');
const { createApp } = require('../src/server');

const T0 = 1_000_000;
const mk = () => {
  const s = sim.createWorld({ nowMs: T0 });
  const a = sim.addPlayer(s, { name: 'Ada', tokenHash: sim.hashToken('ta') }).playerId;
  const b = sim.addPlayer(s, { name: 'Bo', tokenHash: sim.hashToken('tb') }).playerId;
  return { s, a, b };
};
// default: 60 world s per real s, 5 km/h => 20 km = 4 world h = 14400 world s = 240 real s
const ETA_REAL_MS = 240_000;

test('clock maps real time to world time', () => {
  const { s } = mk();
  assert.equal(sim.worldTimeS(s, T0 + 1000), 60);
});

test('travel takes time and completes only after ETA', () => {
  const { s, a } = mk();
  const r = sim.submitCommand(s, a, { id: 'c1', type: 'travel', toLocationId: 'hillford' }, T0);
  assert.equal(r.ok, true);
  sim.advance(s, T0 + ETA_REAL_MS - 1000);
  assert.equal(s.players[a].locationId, null);
  sim.advance(s, T0 + ETA_REAL_MS + 1000);
  assert.equal(s.players[a].locationId, 'hillford');
  assert.equal(s.players[a].journeyId, null);
});

test('duplicate command id is idempotent (one journey only)', () => {
  const { s, a } = mk();
  const c = { id: 'dup', type: 'travel', toLocationId: 'hillford' };
  const r1 = sim.submitCommand(s, a, c, T0), r2 = sim.submitCommand(s, a, c, T0 + 1000);
  assert.equal(r2.duplicate, true);
  assert.equal(r2.journeyId, r1.journeyId);
  assert.equal(Object.keys(s.journeys).length, 1);
});

test('invalid commands are rejected', () => {
  const { s, a } = mk();
  assert.equal(sim.submitCommand(s, a, { id: 'x1', type: 'travel', toLocationId: 'saltmarsh' }, T0).error, 'no_route');
  assert.equal(sim.submitCommand(s, a, { id: 'x2', type: 'teleport' }, T0).error, 'unsupported_command');
  assert.equal(sim.submitCommand(s, a, { type: 'travel' }, T0).error, 'invalid_command_id');
  assert.equal(sim.submitCommand(s, 'nobody', { id: 'x3', type: 'travel', toLocationId: 'hillford' }, T0).error, 'unknown_player');
  sim.submitCommand(s, a, { id: 'x4', type: 'travel', toLocationId: 'hillford' }, T0);
  assert.equal(sim.submitCommand(s, a, { id: 'x5', type: 'travel', toLocationId: 'riverton' }, T0 + 1000).error, 'already_travelling');
});

test('in-progress journey survives save/load (restart)', () => {
  const { s, a } = mk();
  sim.submitCommand(s, a, { id: 'c1', type: 'travel', toLocationId: 'hillford' }, T0);
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'civ-')), 'w.json');
  store.save(f, s);
  const s2 = store.load(f);
  sim.advance(s2, T0 + ETA_REAL_MS + 1000);
  assert.equal(s2.players[a].locationId, 'hillford');
});

test('advance is repeatable without double-applying events', () => {
  const { s, a } = mk();
  sim.submitCommand(s, a, { id: 'c1', type: 'travel', toLocationId: 'hillford' }, T0);
  sim.advance(s, T0 + ETA_REAL_MS + 1000); sim.advance(s, T0 + ETA_REAL_MS + 2000);
  assert.equal(s.log.filter((l) => l.type === 'arrived').length, 1);
});

test("view hides other players' journeys, token hashes and audit log", () => {
  const { s, a, b } = mk();
  sim.submitCommand(s, a, { id: 'c1', type: 'travel', toLocationId: 'hillford' }, T0);
  const v = sim.viewFor(s, b, T0 + 1000);
  const text = JSON.stringify(v);
  assert.deepEqual(v.journeys, []);
  assert.ok(!text.includes('ownerId') && !text.includes('tokenHash') && !text.includes('arrived'));
  assert.equal(v.players[0].locationId, undefined);
  assert.equal(v.players[0].journeyId, undefined);
});

test('HTTP: auth required, commands scoped to caller, hidden state not leaked', async () => {
  let t = T0;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'civ-'));
  const { server } = createApp({ statePath: path.join(dir, 'w.json'), now: () => t });
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, p, token, body) => {
    const res = await fetch(base + p, { method, headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) });
    return { status: res.status, json: await res.json() };
  };
  try {
    assert.equal((await call('GET', '/state')).status, 401);
    const A = (await call('POST', '/join', null, { name: 'Ada' })).json;
    const B = (await call('POST', '/join', null, { name: 'Bo' })).json;
    const r = await call('POST', '/commands', A.token, { id: 'c1', type: 'travel', toLocationId: 'hillford', playerId: B.playerId });
    assert.equal(r.status, 200);
    const bState = await call('GET', '/state', B.token);
    assert.equal(bState.json.you.locationId, 'riverton'); // body playerId was ignored
    assert.deepEqual(bState.json.journeys, []);
    t += ETA_REAL_MS + 1000;
    assert.equal((await call('GET', '/state', A.token)).json.you.locationId, 'hillford');
  } finally { server.close(); }
});
