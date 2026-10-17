'use strict';
const http = require('node:http');
const crypto = require('node:crypto');
const sim = require('./sim');
const store = require('./store');

function createApp({ statePath, now = Date.now }) {
  const state = store.load(statePath) || sim.createWorld({ nowMs: now() });
  const persist = () => store.save(statePath, state);

  const readJson = (req) => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 10_000) { reject(new Error('too_large')); req.destroy(); } });
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('bad_json')); } });
  });

  const server = http.createServer(async (req, res) => {
    const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
    try {
      const t = now();
      if (req.method === 'GET' && req.url === '/time') return send(200, { worldTimeS: sim.worldTimeS(state, t) });
      if (req.method === 'POST' && req.url === '/join') {
        const body = await readJson(req);
        const token = crypto.randomBytes(24).toString('hex');
        const r = sim.addPlayer(state, { name: body.name, tokenHash: sim.hashToken(token) });
        if (!r.ok) return send(400, r);
        persist();
        return send(201, { playerId: r.playerId, token }); // token shown once
      }
      const auth = (req.headers.authorization || '').replace(/^Bearer /, '');
      const playerId = sim.authenticate(state, auth);
      if (!playerId) return send(401, { ok: false, error: 'unauthorized' });
      sim.advance(state, t); // lazy catch-up: due events are processed on wake, no background timer needed
      if (req.method === 'GET' && req.url === '/state') { persist(); return send(200, sim.viewFor(state, playerId, t)); }
      if (req.method === 'POST' && req.url === '/commands') {
        const out = sim.submitCommand(state, playerId, await readJson(req), t);
        persist();
        return send(out.ok ? 200 : 422, out);
      }
      return send(404, { ok: false, error: 'not_found' });
    } catch (e) {
      const client = e.message === 'bad_json' || e.message === 'too_large';
      return send(client ? 400 : 500, { ok: false, error: client ? e.message : 'internal' });
    }
  });
  return { server, state };
}

if (require.main === module) {
  const { server } = createApp({ statePath: process.env.STATE_PATH || './data/world.json' });
  server.listen(process.env.PORT || 3000, () => console.log('civ-sim listening on', server.address().port));
}
module.exports = { createApp };
