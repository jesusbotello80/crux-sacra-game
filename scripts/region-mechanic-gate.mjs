import { readFile } from 'node:fs/promises';

// Lantern pilot: the region-2 environment mechanic (dusk darkness system).
// One 4-world block (Guadalajara/El Rancho/Mexico City/Bedtime Rooms) plays
// under darkness; everything keys off REGION_MECHANIC by region number —
// per-world engine branches are forbidden, and other regions must read null
// (unchanged behavior). Tunables await the owner/Family fun judgment.
const game = await readFile(new URL('../game/game.js', import.meta.url), 'utf8');
const failures = [];

const checks = [
  ['pilot scope is region 2 only', 'const REGION_MECHANIC = {2: "lantern"};'],
  ['mechanic resolves by region, defaulting null', 'function regionMechanic(worldId) { return REGION_MECHANIC[regionForWorld(worldId || game.world)] || null; }'],
  ['tunables exposed for fun judgment', 'const LANTERN_TUNABLES = {dangerMul: 1.5, chaseMul: 1.12, radiusLit: 290, radiusDark: 150, edgeAlpha: 0.82};'],
  ['darkness raises cross danger', 'function lanternDangerMul() { return regionMechanic() === "lantern" ? LANTERN_TUNABLES.dangerMul : 1; }'],
  ['villain chases faster while unlit', 'function lanternChaseMul() { return regionMechanic() === "lantern" && game.lux <= 0 ? LANTERN_TUNABLES.chaseMul : 1; }'],
  ['lantern radius engine', 'function lanternRadius() {'],
  ['darkness overlay renderer', 'function drawLanternDarkness() {'],
  ['overlay skips non-pilot regions', 'if (regionMechanic() !== "lantern") { game.lanternDarkAnnounced = false; return; }'],
  ['overlay runs after the field render', 'drawParticles();\n    drawLanternDarkness();'],
  ['overlay runs before the travel/message layer', 'drawLanternDarkness();\n    if (game.mode === "travel") drawTravelOverlay();'],
  ['danger honors the lantern multiplier', '* lanternDangerMul()'],
  ['chase honors the lantern multiplier', '* lanternChaseMul() * dt'],
];
for (const [label, needle] of checks) {
  if (!game.includes(needle)) failures.push(label);
}

// Ungot crosses re-stamp bright as beacons: the drawCross call appears once
// in the normal prop pass and once more inside the darkness overlay.
const beaconHits = game.split('drawCross(cross.x, cross.y, 0.7 + Math.sin(game.time * 4 + cross.x) * 0.05, cross.danger || 0);').length - 1;
if (beaconHits !== 2) failures.push(`cross beacons re-stamped once in the overlay (found ${beaconHits} sites, want 2)`);

// The darkness hint ships bilingual on canvas and the screen-reader status.
const hintHits = game.split('Stay near the light! / ¡Quédate cerca de la luz!').length - 1;
if (hintHits < 2) failures.push(`lantern hint bilingual canvas + status (found ${hintHits}, want >= 2)`);

// Pilot scope lock: the mechanic map must not quietly grow per-world
// entries — remaining regions file as follow-ups after fun-confirm.
const mapMatch = game.match(/const REGION_MECHANIC = \{([^}]*)\}/);
if (!mapMatch || mapMatch[1].split(',').filter(Boolean).length !== 1) {
  failures.push('REGION_MECHANIC holds exactly the pilot entry');
}

// No one-off engine branches: the lantern block keys off the region number
// only — no world-id literals or per-world comparisons inside it.
const blockStart = game.indexOf('const REGION_MECHANIC');
const blockEnd = game.indexOf('function startMusic(');
const block = blockStart === -1 || blockEnd === -1 ? null : game.slice(blockStart, blockEnd);
if (!block) {
  failures.push('lantern block not found');
} else {
  for (const literal of ['"guadalajara"', '"elrancho"', '"mexicocity"', '"elcoco"', 'game.world ===']) {
    if (block.includes(literal)) failures.push(`per-world branch inside lantern block: ${literal}`);
  }
}

if (failures.length) throw new Error(`REGION MECHANIC GATE: FAIL — ${failures.join(', ')}`);
console.log('REGION MECHANIC GATE: PASS — lantern pilot is region-scoped, config-driven, bilingual, and leaves other regions untouched.');
