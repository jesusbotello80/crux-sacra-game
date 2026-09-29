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
 * 12. RT2-KID-1: difficulty buttons bilingual; rules caption 15px; pause
 *    quit button (hidden until paused, wired to quitToSelection); Start
 *    ships disabled until boot settles; load-retry path wired; pause
 *    overlay carries the tap resume/quit lines.
 * 13. RT2-A11Y-1: manifest orientation "any", display "standalone", a 192x192
 *    icon, and purpose + ?v= on every icon.
 * 14. RT2-A11Y-2: dialog focus trap (trapTabInModal) + background inert sync
 *    (syncModalInert) + Escape cascade past help (intro/final/credits).
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
if (!gameJs.includes("Pulsa P para seguir")) {
  failures.push("game/game.js pause key hints are missing their ES half (Pulsa P para seguir)");
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
    // RT3-ART-1: walk-cycle QA pins (frame counts eyeball-verified; update deliberately with art)
    if (sources.daroeSheet !== "character-sprites/daroe/daroe-walk-sheet-right-packed.png") {
      failures.push(`daroeSheet must be the right-packed sheet (facing-right sheet is 5 static fronts): ${sources.daroeSheet}`);
    }
    if (frames.daroeWalk !== 3) failures.push(`daroeWalk must be the 3-frame [walk, run, walk] cycle, found ${frames.daroeWalk} rects`);
    for (const name of ["gaspaRaspaWalk", "tioAbueloOriginalWalk"]) {
      if (frames[name] !== 2) failures.push(`${name} must be the 2-frame no-sprint walk, found ${frames[name] ?? 0} rects`);
    }
    if (frames.grid1774Walk !== 3) failures.push(`grid1774Walk must stay 3-frame for tia-more/viktorock, found ${frames.grid1774Walk} rects`);
    // RT3-ART-2: dup-frame drops (eyeball-verified; see docs/reviews/round3-art-cycles-2026-09-29.md)
    for (const [name, want] of [["nanaWalk", 6], ["donaNeneWalk", 7], ["tanWalk", 7], ["mrZuilWalk", 7], ["fatherVWalk", 7], ["fatherMWalk", 7], ["lordSantyWalk", 7], ["michaelMove", 2]]) {
      if (frames[name] !== want) failures.push(`${name} must have ${want} rects after dup-drop, found ${frames[name] ?? 0}`);
    }
    // Redemption reachability pin: every unlock path needs code + UI button (audited 2026-09-29, all 17 reachable)
    const redeemFn = gameJs.match(/function redeemedKeyForHero\(\) \{[\s\S]*?\n  \}/);
    const redeemBody = redeemFn ? redeemFn[0] : "";
    for (const [key, why] of [["donLalo", "mrChuy+mrsFavi pair"], ["angeliux", "nana+nana pair"], ["srJoe", "mrTio chain"], ["lordSanty", "donaCarmelina chain"], ["donaNene", "tan chain"]]) {
      if (!redeemBody.includes(`"${key}"`)) failures.push(`redemption path missing for ${key} (${why})`);
    }
    const heroBtns = new Set([...indexHtml.matchAll(/data-role="hero" data-character="([A-Za-z0-9_]+)"/g)].map((m) => m[1]));
    const compBtns = new Set([...indexHtml.matchAll(/data-role="companion" data-character="([A-Za-z0-9_]+)"/g)].map((m) => m[1]));
    const mapHeroes = [...(gameJs.match(/const redeemedCharacterByHero = \{[^}]*\}/s) || [""])[0].matchAll(/([A-Za-z0-9_]+): "/g)].map((m) => m[1]);
    for (const hero of mapHeroes) {
      if (!heroBtns.has(hero)) failures.push(`redemption hero has no hero button: ${hero}`);
    }
    for (const comp of ["nana", "mrChuy", "mrsFavi"]) {
      if (!compBtns.has(comp)) failures.push(`pair-path companion button missing: ${comp}`);
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
for (const entry of ["/", "/index.html", "/game/", "/game/index.html", "/game/guide.html", "/game/game.js", "/game/style.css", "/game/manifest.webmanifest", "/game/icon-512.png", "/game/icon-192.png", "/game/icon.svg"]) {
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

// Check 12: RT2-KID-1 child-UX contracts
const difficultyButtons = [...indexHtml.matchAll(/<button[^>]*class="difficulty-choice[^"]*"[^>]*>([\s\S]*?)<\/button>/g)];
if (difficultyButtons.length !== 3) {
  failures.push(`expected 3 difficulty buttons, found ${difficultyButtons.length}`);
}
for (const button of difficultyButtons) {
  const text = button[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text.includes("/")) {
    failures.push(`difficulty button is not bilingual: ${text}`);
  }
}
const rulesCss = styleCss.match(/\.difficulty-rules\s*\{[^}]*\}/s);
if (!rulesCss || !/font-size:\s*1[5-9]px|font-size:\s*[2-9][0-9]px/.test(rulesCss[0])) {
  failures.push(".difficulty-rules caption is below readable size (want >= 15px)");
}
if (!indexHtml.includes('id="quitButton"') || !/id="quitButton"[^>]*hidden/.test(indexHtml)) {
  failures.push('game/index.html is missing the hidden-until-paused #quitButton');
}
for (const snippet of ["quitButton) quitButton.hidden = false", "quitButton) quitButton.hidden = true", "quitToSelection()"]) {
  if (!gameJs.includes(snippet)) {
    failures.push(`game/game.js is missing quit-flow wiring: ${snippet}`);
  }
}
if (!/id="startButton"[^>]*disabled/.test(indexHtml)) {
  failures.push("game/index.html #startButton must ship disabled until boot settles");
}
for (const snippet of ["startButton.disabled = false", "loadRetryButton", "location.reload()"]) {
  if (!gameJs.includes(snippet)) {
    failures.push(`game/game.js is missing boot-gating wiring: ${snippet}`);
  }
}
for (const line of ["Toca ▶ abajo para seguir", "Toca ✕ para salir"]) {
  if (!gameJs.includes(line)) {
    failures.push(`game/game.js pause overlay is missing bilingual tap line: ${line}`);
  }
}

// Check 13: RT2-A11Y-1 installable PWA baseline (orientation/display/icons)
{
  const manifestPath = path.join(repoRoot, "game", "manifest.webmanifest");
  if (!fs.existsSync(manifestPath)) {
    failures.push("game/manifest.webmanifest is missing");
  } else {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (manifest.orientation !== "any") {
      failures.push('manifest orientation must be "any" (landscape lock fails WCAG 1.3.4)');
    }
    if (manifest.display !== "standalone") {
      failures.push('manifest display must be "standalone" (fullscreen hides a11y chrome)');
    }
    const sizes = (manifest.icons || []).map((icon) => icon.sizes);
    if (!sizes.includes("192x192")) {
      failures.push("manifest is missing a 192x192 icon");
    }
    for (const icon of manifest.icons || []) {
      if (!icon.purpose) failures.push(`manifest icon ${icon.sizes} is missing purpose`);
      if (!icon.src.includes("?v=")) failures.push(`manifest icon ${icon.sizes} is missing ?v=`);
    }
  }
}

// Check 14: RT2-A11Y-2 focus trap + inert + Escape cascade
if (!gameJs.includes("function trapTabInModal(")) {
  failures.push("game/game.js is missing trapTabInModal (dialog focus trap)");
}
if (!gameJs.includes("function syncModalInert(") || !gameJs.includes('"inert"')) {
  failures.push("game/game.js is missing syncModalInert (background inert sync)");
}
const escapeBlock = gameJs.match(/event\.code === "Escape"[\s\S]{0,800}?closeCreditsSequence\(\)/);
if (!escapeBlock || !escapeBlock[0].includes("closeIntro()") || !escapeBlock[0].includes("closeFinalSequence()")) {
  failures.push("game/game.js Escape handler does not cascade past help (intro/final/credits)");
}

// Check 15: RT2-A11Y-3 sync-before-focus order (inert kills programmatic focus)
if (/\.focus\(\);\s*\n\s*syncModalInert\(\);/.test(gameJs)) {
  failures.push("game/game.js calls .focus() before syncModalInert() (inert target swallows focus)");
}

// Check 16: RT-PERF-1 lazy asset sets (boot ~24MB, never dead-ends)
for (const fn of ["function worldAssetKeys(", "function ensureWorldSet(", "function ensureStartBundle(", "const VILLAIN_KEYS_BY_WORLD ="]) {
  if (!gameJs.includes(fn)) failures.push(`game/game.js is missing ${fn} (lazy loading manifest)`);
}
{
  const villainTable = (gameJs.match(/const VILLAIN_KEYS_BY_WORLD = \{[^}]*\}/s) || [""])[0];
  const worldKeys = [...gameJs.match(/const worldSketches = \{[\s\S]*?\n  \};/s)?.[0].matchAll(/^    ([a-z]+): \{$/gm) || []].map((m) => m[1]);
  for (const world of worldKeys) {
    if (!villainTable.includes(`${world}:`)) failures.push(`VILLAIN_KEYS_BY_WORLD has no entry for world: ${world}`);
  }
  const sourcesBlock16 = gameJs.slice(gameJs.indexOf("const sources ="), gameJs.indexOf("const worldSketches ="));
  for (const m of villainTable.matchAll(/"([A-Za-z0-9_]+)"/g)) {
    if (!sourcesBlock16.includes(`${m[1]}:`)) failures.push(`villain key missing from sources: ${m[1]}`);
  }
}
{
  const selectWorldBody = (gameJs.match(/function selectWorld\(worldKey\) \{[\s\S]*?\n  \}/) || [""])[0];
  if (!selectWorldBody.includes("ensureWorldSet(")) failures.push("selectWorld does not top-up its world asset set (lazy world missing)");
  const startHandler = (gameJs.match(/startButton\.addEventListener\("click", [\s\S]*?\n  \}\);/) || [""])[0];
  if (!startHandler.includes("ensureStartBundle(") && !startHandler.includes("ensureWorldSet(")) {
    failures.push("start handler does not ensure gameplay assets before intro (lazy start missing)");
  }
}
if (!/function drawBackground\(\) \{[\s\S]{0,300}?if \(!bgImg\) return;/.test(gameJs)) {
  failures.push("drawBackground does not guard a not-yet-loaded stage bg (lazy crash risk)");
}
if (!/function drawFrame\(img,[\s\S]{0,200}?if \(!img\) return;/.test(gameJs)) {
  failures.push("drawFrame does not guard a missing sheet image (lazy crash risk)");
}

// Check 17: RT-QA-1 character lock re-check (locked stays locked under devtools DOM edits)
{
  const charHandler = (gameJs.match(/characterButtons\.forEach\(\(button\) => \{[\s\S]*?\n  \}\);/) || [""])[0];
  if (!charHandler.includes("redeemedCharacterKeys.has(") || !charHandler.includes("game.unlockedRedeemed.has(")) {
    failures.push("character select handler does not re-check redeemed lock state (locked playable via devtools)");
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
