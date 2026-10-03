import { access, readFile, stat } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const game = await readFile(new URL('game/game.js', root), 'utf8');

const failures = [];

// 17 motif-seeded .m4a files ship under audio/ (see
// docs/audio-provenance.md). Every one must exist in the served tree.
const expected = [
  ...[1, 2, 3].map((n) => `region-${n}-loop.m4a`),
  ...['jump', 'land', 'pickup', 'hurt', 'rescue', 'celebration'].map((k) => `sfx-${k}.m4a`),
  ...['park', 'snow', 'church', 'boss'].flatMap((s) => [`narr-colorado-${s}-es.m4a`, `narr-colorado-${s}-en.m4a`]),
];
let totalBytes = 0;
for (const name of expected) {
  const url = new URL(`audio/${name}`, root);
  try {
    await access(url);
    const { size } = await stat(url);
    totalBytes += size;
    if (name.startsWith('region-') && (size < 100_000 || size > 1_000_000)) {
      failures.push(`region loop ${name} outside 100KB-1MB (${size})`);
    }
    if (name.startsWith('sfx-') && size > 100_000) failures.push(`sfx ${name} over 100KB (${size})`);
    if (name.startsWith('narr-') && (size < 10_000 || size > 500_000)) {
      failures.push(`narration ${name} outside 10-500KB (${size})`);
    }
  } catch {
    failures.push(`missing audio/${name}`);
  }
}
if (totalBytes > 5_000_000) failures.push(`region audio over 5MB (${totalBytes})`);

// Reproducibility: the generator scripts and provenance record ride along.
for (const doc of ['scripts/generate-audio.py', 'scripts/render-narration.sh', 'docs/audio-provenance.md']) {
  try {
    await access(new URL(doc, root));
  } catch {
    failures.push(`missing ${doc}`);
  }
}

// All 10 campaign worlds map to exactly one of the 3 region loops.
const worldIds = [
  'colorado', 'juarez', 'useast', 'elpaso', 'guadalajara',
  'elrancho', 'mexicocity', 'elcoco', 'holymountain', 'saints',
];
const mapMatch = game.match(/const REGION_FOR_WORLD = \{([^}]*)\}/);
if (!mapMatch) {
  failures.push('REGION_FOR_WORLD map');
} else {
  for (const id of worldIds) {
    const hit = mapMatch[1].match(new RegExp(`${id}: (\\d)`));
    if (!hit) failures.push(`region map entry ${id}`);
    else if (+hit[1] < 1 || +hit[1] > 3) failures.push(`region map range ${id}`);
  }
  if (!mapMatch[1].includes('holymountain: 3')) failures.push('finale rides region 3');
}

const checks = [
  ['region loop engine', 'function tryStartRegionLoop() {'],
  ['region loop stop', 'function stopRegionLoop() {'],
  ['loop follows pause/win audibility', 'function syncRegionLoopAudible() {'],
  ['oscillator bed stays as fallback', 'if (regionLoopOn) return;'],
  ['loop error falls back silently', 'regionLoopAudio.addEventListener("error", () => { if (regionLoopWanted) stopRegionLoop(); });'],
  ['sfx sample map', 'const SFX_FILES = {jump: "sfx-jump.m4a", land: "sfx-land.m4a", pickup: "sfx-pickup.m4a", hurt: "sfx-hurt.m4a", rescue: "sfx-rescue.m4a", celebration: "sfx-celebration.m4a"};'],
  ['sfx honors enabled-gate', 'function playSfxFile(kind) {\n    if (!audio.enabled) return false;'],
  ['sfx error marks kind dead', 'sfxDead[kind] = true;'],
  ['narration file map', 'const NARRATION_FILES = {colorado: ["park", "snow", "church", "boss"]};'],
  ['narration engine', 'function tryStageNarration(index) {'],
  ['narration stop releases the file', 'narrationAudio.onended = null; narrationAudio.onerror = null;'],
  ['narration never overlaps a prior clip', 'function tryStageNarration(index) {\n    stopNarrationFile();'],
  ['device language picks the narration half', 'startsWith("es") ? "es" : "en"'],
  ['audio urls carry the asset version', 'audio/" + file + "?v=" + ASSET_VERSION'],
  ['loop level', 'makeAudioEl(0.12)'],
  ['sfx level', 'makeAudioEl(0.15)'],
  ['narration level', 'makeAudioEl(1.0)'],
];
for (const [label, needle] of checks) {
  if (!game.includes(needle)) failures.push(label);
}

// Every SFX kind dispatches file-first from its play function.
for (const kind of ['jump', 'land', 'pickup', 'hurt', 'rescue', 'celebration']) {
  if (!game.includes(`if (playSfxFile("${kind}")) return;`)) failures.push(`file-first dispatch ${kind}`);
}

// startMusic kicks the region loop; finish and title-return release it.
for (const [label, fn] of [['startMusic', 'startMusic'], ['finish', 'finish'], ['showCharacterSelect', 'showCharacterSelect']]) {
  const body = (game.match(new RegExp(`function ${fn}\\([\\s\\S]*?\\n  \\}`)) || [''])[0];
  const want = fn === 'startMusic' ? 'tryStartRegionLoop();' : 'stopRegionLoop();';
  if (!body.includes(want)) failures.push(`${label} misses ${want}`);
  if (fn !== 'startMusic' && !body.includes('stopNarrationFile();')) failures.push(`${label} misses stopNarrationFile();`);
}

// Narration speaks exact world-1 story strings: all 8 source halves present.
for (const half of [
  'Level 1 - Summer Park / Parque', 'Collect all crosses. Junta todas las cruces.',
  'Level 2 - Winter Snow / Nieve', 'Find the crosses in the snow. Encuentra las cruces en la nieve.',
  'Level 3 - Pater Noster / Padre Nuestro', 'Gather prayer light. Reúne la luz de la oración.',
  'Boss - El Tacalache', 'Collect Lux, then pray near El Tacalache. Junta Lux y reza junto a El Tacalache.',
]) {
  if (!game.includes(half)) failures.push(`narration source string drifted: ${half}`);
}

// Check 20 parity: the v129 dead-speech purge stays in force — narration is
// file-only with the plaque text as fallback, never live voice synthesis.
for (const banned of ['speechSynthesis', 'SpeechSynthesisUtterance']) {
  if (game.includes(banned)) failures.push(`dead-speech purge regressed: ${banned}`);
}

if (failures.length) throw new Error(`REGION AUDIO GATE: FAIL — ${failures.join(', ')}`);
console.log('REGION AUDIO GATE: PASS — 3 region loops, 6 sfx samples, and world-1 narration ship with oscillator fallbacks and no-overlap guards.');
