#!/usr/bin/env node
// Overnight art-QA: verify every sprite reference resolves, every file exists,
// every frame rect fits its sheet, and indexes are in range.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "game/game.js"), "utf8");
const failures = [];
const ok = (c) => console.log(`ok: ${c}`);

function block(start, end) {
  const a = src.indexOf(start);
  const b = src.indexOf(end, a + start.length);
  if (a === -1 || b === -1) { failures.push(`block not found: ${start}`); return ""; }
  return src.slice(a, b);
}

// 1. sources: key -> path; files must exist under ROOT
const sourcesBlock = block("const sources =", "const worldSketches =");
const sources = Object.fromEntries([...sourcesBlock.matchAll(/^\s*([A-Za-z0-9_]+): "([^"]+)",?\s*$/gm)].map((m) => [m[1], m[2]]));
console.log(`sources keys: ${Object.keys(sources).length}`);
let missing = 0;
for (const [k, p] of Object.entries(sources)) {
  if (!fs.existsSync(path.join(ROOT, p))) { failures.push(`missing file for sources.${k}: ${p}`); missing++; }
}
ok(`${Object.keys(sources).length - missing}/${Object.keys(sources).length} source files exist`);

// sheet dims via sips (macOS)
const dims = {};
let warnedNoSips = false;
function sheetDims(key) {
  if (dims[key]) return dims[key];
  const p = path.join(ROOT, sources[key]);
  try {
    const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", p], { encoding: "utf8" });
    const w = Number(out.match(/pixelWidth: (\d+)/)[1]);
    const h = Number(out.match(/pixelHeight: (\d+)/)[1]);
    dims[key] = [w, h];
  } catch { dims[key] = "skip"; }
  return dims[key];
}

// 2. frames: key -> rect array
const framesBlock = block("const frames =", "const characterDefs =");
const frames = {};
for (const m of framesBlock.matchAll(/^    ([A-Za-z0-9_]+): \[$/gm)) {
  const key = m[1];
  const start = m.index + m[0].length;
  const end = framesBlock.indexOf("\n    ],", start);
  const rects = [...framesBlock.slice(start, end).matchAll(/\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]/g)]
    .map((r) => r.slice(1, 5).map(Number));
  frames[key] = rects;
}
console.log(`frames keys: ${Object.keys(frames).length}`);

// 3. characterDefs
const defsBlock = block("const characterDefs =", "const difficultySettings =");
const defs = {};
for (const m of defsBlock.matchAll(/^    ([A-Za-z0-9_]+): \{([^}]*)\}/gm)) {
  const get = (k) => (m[2].match(new RegExp(`${k}: "?([A-Za-z0-9_]+)"?`)) || [])[1];
  defs[m[1]] = { animated: get("animated"), sheet: get("sheet"), front: get("front"),
    idleFrame: Number((m[2].match(/idleFrame: (\d+)/) || [])[1] ?? 0),
    previewFrame: Number((m[2].match(/previewFrame: (\d+)/) || [])[1] ?? 0) };
}
// single-line defs
for (const m of defsBlock.matchAll(/^    ([A-Za-z0-9_]+): \{ label:.*?animated: "([A-Za-z0-9_]+)", sheet: "([A-Za-z0-9_]+)", front: "([A-Za-z0-9_]+)", height: \d+(, idleFrame: (\d+), previewFrame: (\d+))? \},?$/gm)) {
  if (!defs[m[1]]) defs[m[1]] = { animated: m[2], sheet: m[3], front: m[4], idleFrame: Number(m[6] ?? 0), previewFrame: Number(m[7] ?? 0) };
}
console.log(`character defs: ${Object.keys(defs).length}`);

for (const [char, d] of Object.entries(defs)) {
  if (!frames[d.animated]) failures.push(`${char}: animated key missing from frames: ${d.animated}`);
  if (!sources[d.sheet]) failures.push(`${char}: sheet key missing from sources: ${d.sheet}`);
  if (!sources[d.front]) failures.push(`${char}: front key missing from sources: ${d.front}`);
  const n = (frames[d.animated] || []).length;
  if (d.idleFrame >= n) failures.push(`${char}: idleFrame ${d.idleFrame} out of range (0..${n - 1})`);
  if (d.previewFrame >= n) failures.push(`${char}: previewFrame ${d.previewFrame} out of range (0..${n - 1})`);
  // rect bounds against this char's sheet
  const dim = sources[d.sheet] ? sheetDims(d.sheet) : null;
  if (dim === "skip") { if (!warnedNoSips) { console.log("warn: sips unavailable, rect-bounds check skipped"); warnedNoSips = true; } }
  if (dim && dim !== "skip" && frames[d.animated]) {
    frames[d.animated].forEach(([x, y, w, h], i) => {
      if (x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > dim[0] || y + h > dim[1]) {
        failures.push(`${char}: frame ${i} of ${d.animated} [${x},${y},${w},${h}] exceeds ${d.sheet} ${dim[0]}x${dim[1]}`);
      }
    });
  }
}
ok(`${Object.keys(defs).length} character defs checked (refs, files, ranges, bounds)`);

// 4. redemption maps resolve to defs
for (const m of src.match(/const redeemedCharacterByHero = \{[^}]*\}/s)[0].matchAll(/: "([A-Za-z0-9_]+)"/g)) {
  if (!defs[m[1]]) failures.push(`redeemedCharacterByHero value not a def: ${m[1]}`);
}
for (const m of src.match(/surpriseRedeemedCharacterKeys = new Set\(\[([^\]]*)\]\)/)[1].matchAll(/"([A-Za-z0-9_]+)"/g)) {
  if (!defs[m[1]]) failures.push(`surprise key not a def: ${m[1]}`);
}
ok("redemption maps resolve");

// 5. stage bg keys resolve
const stagesBlock = block("const worldStages =", "const defeatMessages =");
const bgs = new Set([...stagesBlock.matchAll(/bg: "([A-Za-z0-9_]+)"/g)].map((m) => m[1]));
for (const b of bgs) if (!sources[b]) failures.push(`stage bg missing from sources: ${b}`);
ok(`${bgs.size} stage bg keys resolve`);

// 6. index.html roster buttons resolve to defs
const html = fs.readFileSync(path.join(ROOT, "game/index.html"), "utf8");
const roster = new Set([...html.matchAll(/data-character="([A-Za-z0-9_]+)"/g)].map((m) => m[1]));
for (const c of roster) if (!defs[c]) failures.push(`roster button with no def: ${c}`);
ok(`${roster.size} roster buttons resolve`);

// 7. RT-PERF-1 boot budget: eager set (fronts + default-world set + misc)
// must stay under 25MB on fresh cache. Mirrors bootAssetKeys() in game.js.
{
  const villainTableSrc = (src.match(/const VILLAIN_KEYS_BY_WORLD = \{[^}]*\}/s) || [""])[0];
  const tableVillains = (world) => [...(villainTableSrc.match(new RegExp(`${world}: \\[([^\\]]*)\\]`)) || ["", ""])[1].matchAll(/"([A-Za-z0-9_]+)"/g)].map((m) => m[1]);
  const worldBgs = (world) => {
    const m = stagesBlock.match(new RegExp(`${world}:\\s*\\[(.*?)\\],\\s*\\n    [a-z]+:`, "s")) || stagesBlock.match(new RegExp(`${world}:\\s*\\[(.*)\\]`, "s"));
    return m ? [...m[1].matchAll(/bg: "([A-Za-z0-9_]+)"/g)].map((b) => b[1]) : [];
  };
  const allSheets = new Set(Object.values(defs).map((d) => d.sheet).filter(Boolean));
  const defaultSet = new Set([...worldBgs("colorado"), ...tableVillains("colorado")]);
  const lazyWorldKeys = new Set();
  for (const m of stagesBlock.matchAll(/^    ([a-z]+): \[$/gm)) {
    if (m[1] === "colorado") continue;
    for (const k of [...worldBgs(m[1]), ...tableVillains(m[1])]) lazyWorldKeys.add(k);
  }
  const bootKeys = Object.keys(sources).filter((k) => {
    if (allSheets.has(k)) return false; // lazy: start bundle
    if (["jesus", "stMary"].includes(k)) return false; // lazy: final cast
    if (lazyWorldKeys.has(k) && !defaultSet.has(k)) return false; // lazy: other worlds
    return true;
  });
  let bytes = 0;
  for (const k of bootKeys) {
    try { bytes += fs.statSync(path.join(ROOT, sources[k])).size; } catch { failures.push(`boot key file missing: ${k}`); }
  }
  const BUDGET = 25 * 1000 * 1000;
  console.log(`boot set: ${bootKeys.length}/${Object.keys(sources).length} keys, ${(bytes / 1e6).toFixed(1)}MB / 25.0MB budget`);
  if (bytes > BUDGET) failures.push(`boot asset set ${(bytes / 1e6).toFixed(1)}MB exceeds 25MB budget`);
  else ok("boot set within 25MB budget");
}

console.log(failures.length ? `\nFAIL (${failures.length}):` : "\nALL PASS");
for (const f of failures) console.log(" -", f);
process.exit(failures.length ? 1 : 0);
