#!/usr/bin/env node

/**
 * Release Gate for Crux Sacra 1 (Garme / Classic)
 *
 * Verifies critical public-prod release invariants:
 * 1. game/index.html exists and references ./game.js?v= matching ASSET_VERSION in game/game.js
 * 2. game/game.js contains ranchWorldPublicReady
 * 3. game/game.js does not contain unlockFinal / unlockBonus / unlockRanch query override helpers
 * 4. game/style.css contains LOCKED / BLOQUEADO
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
