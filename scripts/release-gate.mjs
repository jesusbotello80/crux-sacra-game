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
