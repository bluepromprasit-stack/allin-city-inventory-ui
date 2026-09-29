#!/usr/bin/env node
// All In City: keep the fork's Thai fallbacks and the ox locale files in step.
// Every `t('ui_…', 'fallback')` in src/ (plus the category and pane label tables) must have
//   - the same Thai text as the key's value in locales/th.json (the fallback is only a safety net), and
//   - a value in locales/en.json;
// and every `ui_dt_*` key of th.json/en.json must be used by the source (no orphans), with th/en key sets equal.
// The locale files are ox_inventory's own (patches/ox_inventory/003-dt-th-locale.patch adds them).
//
//   node scripts/check-locale.mjs                      # locales of the vendored resource (All In City monorepo)
//   node scripts/check-locale.mjs --locales <dir>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, '../src');
const args = process.argv.slice(2);
const at = args.indexOf('--locales');
const LOCALES =
  at >= 0 ? path.resolve(args[at + 1]) : path.resolve(HERE, '../../../../resources/[core]/ox_inventory/locales');

const read = (p) => fs.readFileSync(p, 'utf8');
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
};

const unquote = (s) => s.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
const used = new Map(); // key -> fallback
const errors = [];

for (const file of walk(SRC)) {
  const text = read(file);
  for (const m of text.matchAll(/\bt\(\s*'(ui_[a-z0-9_]+)'\s*,\s*('(?:[^'\\]|\\.)*')/g)) {
    const [key, fallback] = [m[1], unquote(m[2])];
    if (used.has(key) && used.get(key) !== fallback)
      errors.push(`${key}: two different fallbacks in src (${JSON.stringify(used.get(key))} / ${JSON.stringify(fallback)})`);
    used.set(key, fallback);
  }
}

// dynamic keys: ui_dt_cat_<id>[_en] from categories.ts, ui_dt_pane_<type>[_en] from RightInventory.tsx
const tableOf = (file, name) => {
  const text = read(path.join(SRC, file));
  const body = text.split(new RegExp(`const ${name}[^=]*= \\{`))[1]?.split('\n};')[0];
  if (!body) throw new Error(`check-locale: table ${name} not found in ${file}`);
  return [...body.matchAll(/^\s*([a-z]+):\s*(\[[^\]]*\]|'[^']*')/gm)].map((m) => [m[1], m[2]]);
};
for (const [id, value] of tableOf('dt/categories.ts', 'LABEL_TH')) used.set(`ui_dt_cat_${id}`, unquote(value));
for (const [id, value] of tableOf('dt/categories.ts', 'LABEL_EN')) used.set(`ui_dt_cat_${id}_en`, unquote(value));
for (const [type, value] of tableOf('components/inventory/RightInventory.tsx', 'PANE')) {
  const [th, en] = [...value.matchAll(/'([^']*)'/g)].map((m) => m[1]);
  used.set(`ui_dt_pane_${type}`, th);
  used.set(`ui_dt_pane_${type}_en`, en);
}

if (!fs.existsSync(path.join(LOCALES, 'th.json'))) {
  console.error(`check-locale: ${path.join(LOCALES, 'th.json')} not found (apply patches/ox_inventory with tools/vendor.sh)`);
  process.exit(2);
}
const th = JSON.parse(read(path.join(LOCALES, 'th.json')));
const en = JSON.parse(read(path.join(LOCALES, 'en.json')));

for (const [key, fallback] of used) {
  if (!(key in en)) errors.push(`${key}: missing in en.json`);
  if (!(key in th)) errors.push(`${key}: missing in th.json`);
  else if (th[key] !== fallback)
    errors.push(`${key}: th.json has ${JSON.stringify(th[key])} but the source fallback is ${JSON.stringify(fallback)}`);
}
for (const key of Object.keys(th)) {
  if (key.startsWith('ui_dt_') && !used.has(key)) errors.push(`${key}: in th.json but not used by src`);
  if (!(key in en)) errors.push(`${key}: in th.json but not in en.json`);
}
for (const key of Object.keys(en)) if (key.startsWith('ui_dt_') && !(key in th)) errors.push(`${key}: in en.json but not in th.json`);
// ox only sends ui_* keys (plus '$' and ammo_type) to the page (client.lua uiLocales)
for (const key of used.keys()) if (!key.startsWith('ui_')) errors.push(`${key}: page keys must start with ui_`);

if (errors.length) {
  for (const e of errors) console.error(`check-locale: ${e}`);
  console.error(`check-locale: ${errors.length} error(s)`);
  process.exit(1);
}
console.log(`check-locale: ${used.size} page keys, th.json == source fallbacks, en.json complete`);
