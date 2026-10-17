'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { STATE_VERSION } = require('./sim');

function save(file, state) { // atomic: write temp, then rename
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state));
  fs.renameSync(tmp, file);
}

function load(file) {
  if (!fs.existsSync(file)) return null;
  const state = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (state.version !== STATE_VERSION) throw new Error(`State version ${state.version} needs a migration`);
  return state;
}

module.exports = { save, load };
