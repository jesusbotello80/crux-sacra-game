import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fails = [];
function checkRefs(file, base) {
  const s = fs.readFileSync(path.join(ROOT, file), "utf8");
  const refs = [...s.matchAll(/(?:src|href|poster)="([^"#]+)(?:#[^"]*)?"/g)].map((m) => m[1])
    .filter((r) => !/^(https?:|data:|mailto:)/.test(r));
  for (const r of refs) {
    const p = path.normalize(path.join(ROOT, base, r.split("?")[0]));
    if (!fs.existsSync(p)) fails.push(`${file}: missing ${r}`);
  }
  console.log(`${file}: ${refs.length} local refs checked`);
}
checkRefs("game/index.html", "game");
checkRefs("game/guide.html", "game");
checkRefs("index.html", "");
const man = JSON.parse(fs.readFileSync(path.join(ROOT, "game/manifest.webmanifest"), "utf8"));
for (const ic of man.icons || []) {
  const p = path.normalize(path.join(ROOT, "game", ic.src.split("?")[0]));
  if (!fs.existsSync(p)) fails.push(`manifest: missing ${ic.src}`);
}
console.log(`manifest: ${(man.icons || []).length} icons checked`);
// video/audio refs in game.js sources-adjacent: intro/final video srcs in index + js maps
const js = fs.readFileSync(path.join(ROOT, "game/game.js"), "utf8");
const vids = [...js.matchAll(/\.\.\/video-intro\/[^"']+\.mp4/g)].map((m) => m[0]);
let vmiss = 0;
for (const v of new Set(vids)) {
  const p = path.normalize(path.join(ROOT, "game", v.split("?")[0]));
  if (!fs.existsSync(p)) { fails.push(`game.js video missing: ${v}`); vmiss++; }
}
console.log(`game.js: ${new Set(vids).size} intro/final videos checked`);
console.log(fails.length ? `\nFAIL (${fails.length}):` : "\nALL PASS");
for (const f of fails.slice(0, 40)) console.log(" -", f);
process.exit(fails.length ? 1 : 0);
