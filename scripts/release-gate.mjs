#!/usr/bin/env node

/**
 * Release Gate for Crux Sacra 1 (Garme / Classic)
 *
 * Verifies critical public-prod release invariants:
 * 1. game/index.html exists and references ./game.js?v= matching ASSET_VERSION in game/game.js
 * 2. game/game.js contains ranchWorldPublicReady
 * 3. game/game.js does not contain unlockFinal / unlockBonus / unlockRanch query override helpers
 * 4. game/style.css contains LOCKED / BLOQUEADO
 * 5. RT-A11Y-2: overlays expose role=dialog; #srStatus live region exists and
 *    is wired in game.js; select buttons sync aria-pressed; compact button
 *    targets are >= 44px (HUD readout chips excluded).
 * 6. RT-I18N-1: player-facing stage/defeat/projectile/canvas strings carry an
 *    ES half ("EN / ES" or "EN. ES." convention; Latin lines exempt), and the
 *    message plaque wraps (wrapMessage).
 * 7. RT-I18N-2/LOGIC-1-tail: El Rancho button ships pre-locked in HTML (no
 *    selectable flash before JS), and the difficulty menu shows bilingual
 *    per-tier rules (difficultyRules caption wired in JS).
 * 8. Sprite refs: every sources file exists; every characterDefs animated /
 *    sheet / front key resolves; idle/preview indexes in range; redemption
 *    maps and roster buttons resolve to defs. (Rect-vs-sheet bounds live in
 *    tools/sprite-audit.mjs, which needs sips.)
 * 9. Asset links: every local src/href in game/index.html, game/guide.html,
 *    root index.html, the webmanifest icons, and every video-intro .mp4
 *    referenced by game.js exists on disk. (Full report: tools/link-audit.)
 * 10. Load feedback: title screen shows a bilingual #loadStatus line while
 *    the 129 boot images load, updated with counts and hidden on success.
 * 11. RT-PERF-2: every local asset ref in the HTML entry points and the
 *    webmanifest icons carries ?v= (page navigations exempt); game.js never
 *    assigns a raw `ASSET + sources[` URL without ?v=${ASSET_VERSION}; the
 *    _headers immutable stanzas cover the versioned asset paths.
 *
 * Exits 0 on PASS, 1 on FAIL.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const indexHtmlPath = path.join(repoRoot, "game", "index.html");
const gameJsPath = path.join(repoRoot, "game", "game.js");
const styleCssPath = path.join(repoRoot, "game", "style.css");

const failures = [];

// Check 1: Files existence
for (const [name, filePath] of [
  ["game/index.html", indexHtmlPath],
  ["game/game.js", gameJsPath],
  ["game/style.css", styleCssPath],
]) {
  if (!fs.existsSync(filePath)) {
    failures.push(`Missing required file: ${name}`);
  }
}

if (failures.length > 0) {
  reportFailures(failures);
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
const gameJs = fs.readFileSync(gameJsPath, "utf8");
const styleCss = fs.readFileSync(styleCssPath, "utf8");

// Check 1b: Version match between index.html and game.js
const htmlVersionMatch = indexHtml.match(/src=["']\.\/game\.js\?v=([^"'\s&]+)["']/);
const jsVersionMatch = gameJs.match(/const\s+ASSET_VERSION\s*=\s*["']([^"']+)["']/);

if (!htmlVersionMatch) {
  failures.push("game/index.html does not contain a script tag referencing './game.js?v=...'");
}
if (!jsVersionMatch) {
  failures.push("game/game.js does not define ASSET_VERSION (e.g. const ASSET_VERSION = \"...\";)");
}

let assetVersion = null;
if (htmlVersionMatch && jsVersionMatch) {
  const htmlVersion = htmlVersionMatch[1];
  const jsVersion = jsVersionMatch[1];
  assetVersion = jsVersion;

  if (htmlVersion !== jsVersion) {
    failures.push(
      `Asset version mismatch: game/index.html has v=${htmlVersion}, but game/game.js has ASSET_VERSION "${jsVersion}"`
    );
  }
}

// Check 2: ranchWorldPublicReady present
if (!gameJs.includes("ranchWorldPublicReady")) {
  failures.push("game/game.js is missing 'ranchWorldPublicReady' guard flag");
}

// Check 3: unlock query cheats absent
const forbiddenCheatTokens = ["unlockFinal", "unlockBonus", "unlockRanch"];
for (const token of forbiddenCheatTokens) {
  if (gameJs.includes(token)) {
    failures.push(`game/game.js contains forbidden cheat token: '${token}'`);
  }
}

// Check 4: Bilingual LOCKED / BLOQUEADO badge
if (!styleCss.includes("LOCKED / BLOQUEADO")) {
  failures.push("game/style.css does not contain bilingual badge text 'LOCKED / BLOQUEADO'");
}

// Check 5: RT-A11Y-2 dialog roles + live region + pressed semantics + 44px targets
const overlayIds = ["titleScreen", "helpScreen", "introScreen", "finalScreen", "creditsScreen", "endScreen"];
for (const id of overlayIds) {
  const tagMatch = indexHtml.match(new RegExp(`<section[^>]*id="${id}"[^>]*>`, "s"));
  if (!tagMatch) {
    failures.push(`game/index.html is missing overlay section '#${id}'`);
  } else if (!tagMatch[0].includes('role="dialog"')) {
    failures.push(`game/index.html overlay '#${id}' does not expose role="dialog"`);
  }
}

const srStatusMatch = indexHtml.match(/<[^>]*id="srStatus"[^>]*>/s);
if (!srStatusMatch) {
  failures.push('game/index.html is missing the #srStatus live-region element');
} else {
  if (!srStatusMatch[0].includes('aria-live="polite"')) {
    failures.push('game/index.html #srStatus does not set aria-live="polite"');
  }
  if (!srStatusMatch[0].includes('role="status"')) {
    failures.push('game/index.html #srStatus does not set role="status"');
  }
}
if (!styleCss.includes(".sr-only")) {
  failures.push("game/style.css is missing the .sr-only visually-hidden helper");
}
if (!gameJs.includes("srStatus")) {
  failures.push("game/game.js does not wire announcements to #srStatus");
}
if (!gameJs.includes("aria-pressed")) {
  failures.push("game/game.js does not sync aria-pressed on select buttons");
}
if (!indexHtml.includes('tabindex="-1"')) {
  failures.push('game/index.html canvas is missing tabindex="-1" for overlay focus management');
}
// Compact button targets must be >= 44px. These exact sub-44px values were the
// old button heights in the two compact media queries; HUD readout chips use
// 30px/25px and are display-only, so they stay allowed.
const retiredCompactHeights = ["min-height: 38px", "min-height: 34px", "min-height: 32px", "min-height: 42px", "min-height: 36px"];
for (const retired of retiredCompactHeights) {
  if (styleCss.includes(retired)) {
    failures.push(`game/style.css still contains sub-44px compact button target '${retired}'`);
  }
}

// Check 6: RT-I18N-1 bilingual player strings ("EN / ES" or "EN. ES." halves;
// Latin liturgical lines exempt) + plaque word-wrap for long bilingual lines.
function sliceBlock(startMarker, endMarker) {
  const start = gameJs.indexOf(startMarker);
  const end = gameJs.indexOf(endMarker, start + startMarker.length);
  return start === -1 || end === -1 ? null : gameJs.slice(start, end);
}
function hasEsHalf(s) {
  return s.includes("/") || s.includes(". ") || s.includes("! ") || s.includes("? ");
}
const LATIN_EXEMPT = new Set(["Crux Sacra Sit Mihi Lux", "Pater Noster, qui es in caelis"]);

const stagesBlock = sliceBlock("const worldStages =", "const defeatMessages =");
if (!stagesBlock) {
  failures.push("game/game.js worldStages block not found for i18n audit");
} else {
  for (const m of stagesBlock.matchAll(/message: "([^"]*)"/g)) {
    if (!hasEsHalf(m[1])) failures.push(`EN-only stage intro: "${m[1]}"`);
  }
  for (const m of stagesBlock.matchAll(/complete: "([^"]*)"/g)) {
    if (!hasEsHalf(m[1]) && !LATIN_EXEMPT.has(m[1])) failures.push(`EN-only stage complete: "${m[1]}"`);
  }
}

const defeatBlock = sliceBlock("const defeatMessages =", "const projectileNames =");
if (!defeatBlock) {
  failures.push("game/game.js defeatMessages block not found for i18n audit");
} else {
  for (const m of defeatBlock.matchAll(/: "([^"]*)"/g)) {
    if (!hasEsHalf(m[1])) failures.push(`EN-only defeat message: "${m[1]}"`);
  }
}

const projectileBlock = sliceBlock("const projectileNames =", "function hazardForWorld");
if (!projectileBlock) {
  failures.push("game/game.js projectileNames block not found for i18n audit");
} else {
  for (const m of projectileBlock.matchAll(/: "([^"]*)"/g)) {
    if (!hasEsHalf(m[1])) failures.push(`EN-only projectile message: "${m[1]}"`);
  }
}

if (!gameJs.includes("Vidas restantes")) {
  failures.push('game/game.js "Lives left" counter is missing its ES half ("Vidas restantes")');
}
const easyLabel = gameJs.match(/easy: \{ label: "([^"]*)"/);
const hardLabel = gameJs.match(/hard: \{ label: "([^"]*)"/);
const regularLabel = gameJs.match(/regular: \{ label: "([^"]*)"/);
if (!easyLabel || !hasEsHalf(easyLabel[1])) failures.push("game/game.js easy difficulty label is missing its ES half");
if (!hardLabel || !hasEsHalf(hardLabel[1])) failures.push("game/game.js hard difficulty label is missing its ES half");
if (!regularLabel || !hasEsHalf(regularLabel[1])) failures.push("game/game.js regular difficulty label is missing its ES half");
if (!gameJs.includes('fillText("Paused. Pausado."')) {
  failures.push('game/game.js pause overlay title is missing its ES half ("Paused. Pausado.")');
}
if (!gameJs.includes("P seguir")) {
  failures.push("game/game.js pause key hints are missing their ES half");
}
if (!gameJs.includes("Una nueva aventura te espera")) {
  failures.push('game/game.js travel banner line "A new adventure opens ahead" is missing its ES half');
}
if (!hasEsHalf((gameJs.match(/"A projectile hit the hero![^"]*"/) || [""])[0].slice(1, -1))) {
  failures.push('game/game.js projectile fallback "A projectile hit the hero!" is missing its ES half');
}
if (!gameJs.includes("function wrapMessage(")) {
  failures.push("game/game.js is missing wrapMessage (bilingual strings need plaque word-wrap)");
}

// Check 7: RT-I18N-2 / RT-LOGIC-1-tail: ranch pre-JS lock + difficulty rules
const ranchButtonMatch = indexHtml.match(/<button[^>]*data-world="elrancho"[^>]*>/s);
if (!ranchButtonMatch) {
  failures.push('game/index.html is missing the El Rancho world button');
} else {
  if (!ranchButtonMatch[0].includes("locked")) {
    failures.push("game/index.html El Rancho button ships without pre-JS 'locked' class (selectable flash)");
  }
  if (!ranchButtonMatch[0].includes("disabled")) {
    failures.push("game/index.html El Rancho button ships without pre-JS 'disabled' (selectable flash)");
  }
}
if (!indexHtml.includes('id="difficultyRules"')) {
  failures.push('game/index.html is missing the #difficultyRules caption element');
}
if (!gameJs.includes("difficultyRules")) {
  failures.push("game/game.js does not wire the #difficultyRules caption");
}

// Check 8: sprite reference integrity (portable subset of tools/sprite-audit)
{
  const sourcesBlock = sliceBlock("const sources =", "const worldSketches =");
  const framesBlock = sliceBlock("const frames =", "const characterDefs =");
  const defsBlock = sliceBlock("const characterDefs =", "const difficultySettings =");
  if (!sourcesBlock || !framesBlock || !defsBlock) {
    failures.push("game/game.js asset blocks not found for sprite audit");
  } else {
    const sources = Object.fromEntries(
      [...sourcesBlock.matchAll(/^\s*([A-Za-z0-9_]+): "([^"]+)",?\s*$/gm)].map((m) => [m[1], m[2]])
    );
    for (const [key, rel] of Object.entries(sources)) {
      if (!fs.existsSync(path.join(repoRoot, rel))) {
        failures.push(`sprite asset file missing: sources.${key} -> ${rel}`);
      }
    }
    const frames = {};
    for (const m of framesBlock.matchAll(/^    ([A-Za-z0-9_]+): \[$/gm)) {
      const start = m.index + m[0].length;
      const end = framesBlock.indexOf("\n    ],", start);
      frames[m[1]] = [...framesBlock.slice(start, end).matchAll(/\[\d+,\s*\d+,\s*\d+,\s*\d+\]/g)].length;
    }
    const defs = new Set();
    const getProp = (body, prop) => (body.match(new RegExp(`${prop}: "?([A-Za-z0-9_]+)"?`)) || [])[1];
    for (const m of defsBlock.matchAll(/^    ([A-Za-z0-9_]+): \{([^}]*)\}/gm)) {
      defs.add(m[1]);
      const animated = getProp(m[2], "animated");
      const sheet = getProp(m[2], "sheet");
      const front = getProp(m[2], "front");
      if (!frames[animated]) failures.push(`${m[1]}: animated key missing from frames: ${animated}`);
      if (!sources[sheet]) failures.push(`${m[1]}: sheet key missing from sources: ${sheet}`);
      if (!sources[front]) failures.push(`${m[1]}: front key missing from sources: ${front}`);
      const idle = Number((m[2].match(/idleFrame: (\d+)/) || [])[1] ?? 0);
      const preview = Number((m[2].match(/previewFrame: (\d+)/) || [])[1] ?? 0);
      const count = frames[animated] || 0;
      if (idle >= count) failures.push(`${m[1]}: idleFrame ${idle} out of range (0..${count - 1})`);
      if (preview >= count) failures.push(`${m[1]}: previewFrame ${preview} out of range (0..${count - 1})`);
    }
    const redeemedMap = gameJs.match(/const redeemedCharacterByHero = \{[^}]*\}/s);
    if (redeemedMap) {
      for (const m of redeemedMap[0].matchAll(/: "([A-Za-z0-9_]+)"/g)) {
        if (!defs.has(m[1])) failures.push(`redeemedCharacterByHero value is not a def: ${m[1]}`);
      }
    }
    for (const m of indexHtml.matchAll(/data-character="([A-Za-z0-9_]+)"/g)) {
      if (!defs.has(m[1])) failures.push(`roster button with no character def: ${m[1]}`);
    }
  }
}

// Check 9: asset-link integrity (summary of tools/link-audit.mjs)
{
  const guideHtmlPath = path.join(repoRoot, "game", "guide.html");
  const rootIndexPath = path.join(repoRoot, "index.html");
  const manifestPath = path.join(repoRoot, "game", "manifest.webmanifest");
  const pages = [
    [indexHtml, path.join(repoRoot, "game"), "game/index.html"],
    [fs.existsSync(guideHtmlPath) ? fs.readFileSync(guideHtmlPath, "utf8") : "", path.join(repoRoot, "game"), "game/guide.html"],
    [fs.existsSync(rootIndexPath) ? fs.readFileSync(rootIndexPath, "utf8") : "", repoRoot, "index.html"],
  ];
  for (const [html, base, label] of pages) {
    for (const m of html.matchAll(/(?:src|href|poster)="([^"#]+)(?:#[^"]*)?"/g)) {
      const ref = m[1];
      if (/^(https?:|data:|mailto:)/.test(ref)) continue;
      if (!fs.existsSync(path.normalize(path.join(base, ref.split("?")[0])))) {
        failures.push(`broken asset link in ${label}: ${ref}`);
      }
    }
  }
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    for (const icon of manifest.icons || []) {
      if (!fs.existsSync(path.normalize(path.join(repoRoot, "game", icon.src.split("?")[0])))) {
        failures.push(`broken manifest icon: ${icon.src}`);
      }
    }
  }
  for (const m of new Set([...gameJs.matchAll(/\.\.\/video-intro\/[^"']+\.mp4/g)].map((x) => x[0]))) {
    if (!fs.existsSync(path.normalize(path.join(repoRoot, "game", m.split("?")[0])))) {
      failures.push(`missing video referenced by game.js: ${m}`);
    }
  }
}

// Check 10: bilingual boot-load feedback
if (!indexHtml.includes('id="loadStatus"')) {
  failures.push('game/index.html is missing the #loadStatus boot progress line');
} else {
  const loadTag = indexHtml.match(/<[^>]*id="loadStatus"[^>]*>([^<]*)</s);
  if (!loadTag || !loadTag[1].includes("Loading") || !loadTag[1].includes("Cargando")) {
    failures.push("game/index.html #loadStatus is not bilingual (Loading / Cargando)");
  }
}
if (!gameJs.includes("loadStatus")) {
  failures.push("game/game.js does not update #loadStatus during boot");
}

// Check 11: versioned asset refs + immutable header coverage (RT-PERF-2)
const htmlEntryPoints = [
  ["index.html", path.join(repoRoot, "index.html")],
  ["game/index.html", indexHtmlPath],
  ["game/guide.html", path.join(repoRoot, "game", "guide.html")],
];
const isPageNavigation = (ref) =>
  ref === "./" || ref === "./game/" || ref === "guide.html" ||
  ref.startsWith("#") || ref.startsWith("http") || ref.startsWith("data:") ||
  /\.html?$/.test(ref.split("?")[0]);
for (const [name, filePath] of htmlEntryPoints) {
  const html = fs.readFileSync(filePath, "utf8");
  const refs = [...html.matchAll(/(?:src|href|poster)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (isPageNavigation(ref)) continue;
    if (!ref.includes("?v=")) {
      failures.push(`${name} has an unversioned asset ref: ${ref}`);
    }
  }
}
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "game", "manifest.webmanifest"), "utf8"));
  for (const icon of manifest.icons || []) {
    if (!String(icon.src || "").includes("?v=")) {
      failures.push(`game/manifest.webmanifest icon is unversioned: ${icon.src}`);
    }
  }
} catch (err) {
  failures.push(`game/manifest.webmanifest is unreadable: ${err.message}`);
}
for (const line of gameJs.split("\n")) {
  if (line.includes("ASSET + sources[") && !line.includes("ASSET_VERSION")) {
    failures.push(`game/game.js assigns a raw ASSET + sources[] URL without ?v=: ${line.trim().slice(0, 80)}`);
  }
}
for (const m of styleCss.matchAll(/url\("([^"]+)"\)/g)) {
  if (!m[1].includes("?v=")) {
    failures.push(`game/style.css has an unversioned url() ref under immutable caching: ${m[1]}`);
  }
}
const headersFile = fs.readFileSync(path.join(repoRoot, "_headers"), "utf8");
for (const assetPath of ["/character-sprites/*", "/video-demo/*", "/video-intro/*", "/audio/*", "/game/assets/*"]) {
  if (!headersFile.includes(assetPath) || !headersFile.includes("immutable")) {
    failures.push(`_headers is missing immutable coverage for ${assetPath}`);
    break;
  }
}
// Pages MERGES all matching _headers rules: a /* no-store catch-all would
// concatenate with (and defeat) the immutable stanzas. Forbid it.
if (/^\s*\/\*\s*$/m.test(headersFile)) {
  failures.push("_headers must not contain a /* catch-all (it merges with immutable stanzas)");
}
if (/^\s*\/game\/\*\s*$/m.test(headersFile)) {
  failures.push("_headers must not contain a /game/* catch-all (it overlaps /game/assets/* immutable)");
}
for (const entry of ["/", "/index.html", "/game/", "/game/index.html", "/game/guide.html", "/game/game.js", "/game/style.css", "/game/manifest.webmanifest", "/game/icon-512.png", "/game/icon.svg"]) {
  if (!headersFile.includes(entry)) {
    failures.push(`_headers is missing an enumerated no-store rule for ${entry}`);
  }
}
// Every video-intro literal referenced by game.js must carry its own ?v=
// (frozen URL = frozen bytes under immutable; bump the number on re-render).
for (const match of gameJs.matchAll(/["']([a-zA-Z0-9_./-]*video-intro[^"']*\.mp4[^"']*)["']/g)) {
  if (!match[1].includes("?v=")) {
    failures.push(`game/game.js video literal is unversioned: ${match[1]}`);
  }
}

if (failures.length > 0) {
  reportFailures(failures);
  process.exit(1);
}

console.log(`[PASS] Crux Sacra release gate passed.`);
console.log(`       ASSET_VERSION: ${assetVersion}`);
console.log(`       Cache query:   ./game.js?v=${assetVersion}`);
console.log(`       Guards:        ranchWorldPublicReady present, unlock cheats absent`);
console.log(`       Badges:        LOCKED / BLOQUEADO present`);
process.exit(0);

function reportFailures(errs) {
  console.error(`[FAIL] Crux Sacra release gate failed (${errs.length} error${errs.length === 1 ? "" : "s"}):`);
  for (const err of errs) {
    console.error(`  - ${err}`);
  }
}
