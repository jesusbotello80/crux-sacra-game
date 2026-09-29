#!/usr/bin/env node
// Headless smoke: boot game.js against a faithful DOM stub (ids + buttons
// parsed from the real index.html), click through Start -> skip intro ->
// difficulty/world/character selects, run 90 gameplay frames. Any exception
// or failed assertion exits nonzero.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(ROOT, "game/index.html"), "utf8");
const js = fs.readFileSync(path.join(ROOT, "game/game.js"), "utf8");
const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); else console.log(`ok: ${msg}`); };

// ---- parse real markup ----
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
const seedText = {};
for (const m of html.matchAll(/<([a-z]+)[^>]*id="([^"]+)"[^>]*>([^<]*)</g)) seedText[m[2]] = m[3];
const buttonTags = [...html.matchAll(/<button([^>]*)>/g)].map((m) => m[1]);
function parseButtons() {
  return buttonTags.map((attrs) => {
    const data = {};
    for (const d of attrs.matchAll(/data-([a-zA-Z]+)="([^"]*)"/g)) data[d[1]] = d[2];
    const cls = (attrs.match(/class="([^"]*)"/) || ["", ""])[1].split(/\s+/).filter(Boolean);
    return { cls, data };
  });
}
const parsedButtons = parseButtons();

// ---- stubs ----
function makeClassList(el) {
  const set = new Set(el._cls);
  return {
    add: (...c) => c.forEach((x) => set.add(x)),
    remove: (...c) => c.forEach((x) => set.delete(x)),
    toggle: (c, f) => {
      if (f === undefined) { if (set.has(c)) set.delete(c); else set.add(c); }
      else if (f) set.add(c); else set.delete(c);
    },
    contains: (c) => set.has(c),
  };
}
const ctxStub = new Proxy({}, {
  get: (t, p) => {
    if (p === "measureText") return () => ({ width: 300 });
    if (p === "getImageData") return () => ({ data: [] });
    if (p === "createLinearGradient" || p === "createRadialGradient") return () => ({ addColorStop: () => {} });
    if (typeof p === "string" && p in t) return t[p];
    return typeof p === "string" ? (...a) => undefined : undefined;
  },
  set: (t, p, v) => { t[p] = v; return true; },
});
function makeEl(tag, extra = {}) {
  const el = {
    tagName: tag.toUpperCase(), _cls: extra.cls || [], dataset: extra.data || {},
    style: {}, hidden: false, disabled: false, textContent: "", innerHTML: "",
    width: 1280, height: 720, src: "", currentTime: 0, _attrs: {}, listeners: {},
    addEventListener: (t, f) => { (el.listeners[t] = el.listeners[t] || []).push(f); },
    removeEventListener: () => {}, append: () => {}, appendChild: () => {},
    querySelector: () => null, querySelectorAll: () => [],
    setAttribute: (k, v) => { el._attrs[k] = String(v); },
    getAttribute: (k) => el._attrs[k] ?? null,
    removeAttribute: (k) => { delete el._attrs[k]; },
    focus: () => {}, click: () => fire(el, "click"),
    getContext: () => ctxStub, load: () => {}, pause: () => {},
    play: () => ({ catch: () => {} }),
    toDataURL: () => "data:,",
  };
  el.classList = makeClassList(el);
  return el;
}
function fire(el, type, event = {}) {
  for (const fn of el.listeners[type] || []) fn({ preventDefault: () => {}, ...event });
}
const elsById = {};
const queryCache = {};
global.document = {
  getElementById: (id) => {
    if (!ids.has(id)) return null;
    if (!elsById[id]) { elsById[id] = makeEl(id === "game" ? "canvas" : "div"); if (seedText[id] !== undefined) elsById[id].textContent = seedText[id]; }
    return elsById[id];
  },
  querySelectorAll: (sel) => {
    if (!queryCache[sel]) {
      const cls = sel.replace(/^\./, "");
      queryCache[sel] = parsedButtons.filter((b) => b.cls.includes(cls)).map((b) => makeEl("button", b));
    }
    return queryCache[sel];
  },
  querySelector: () => null,
  createElement: (tag) => makeEl(tag),
};
global.windowListeners = {};
global.window = {
  addEventListener: (t, f) => { (global.windowListeners[t] = global.windowListeners[t] || []).push(f); },
  removeEventListener: () => {},
  location: { search: "" },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  confirm: () => false,
  setTimeout: setTimeout.bind(globalThis),
  clearTimeout: clearTimeout.bind(globalThis),
};
global.Image = class {
  set src(v) { this._src = v; setImmediate(() => { if (this.onload) this.onload(); }); }
};
let frames = 0;
let preFrames = 0;
const MAX_FRAMES = 90;
let finished = false;
let didInteract = false;
global.requestAnimationFrame = (cb) => {
  if (finished) return 0;
  if (!didInteract) {
    if (++preFrames > 500) { failures.push("boot never completed (loadStatus stuck)"); setImmediate(finish); return 0; }
    if (elsById["loadStatus"] && elsById["loadStatus"].hidden) {
      didInteract = true;
      try { interact(); } catch (e) { failures.push(`interaction exception: ${String(e && e.stack || e).split("\n").slice(0, 3).join(" | ")}`); }
    }
    setImmediate(() => { try { cb(performance.now()); } catch (e) { failures.push(`loop exception: ${String(e && e.stack || e).split("\n").slice(0, 3).join(" | ")}`); setImmediate(finish); } });
    return 0;
  }
  if (++frames > MAX_FRAMES) { setImmediate(finish); return 0; }
  setImmediate(() => { try { cb(performance.now()); } catch (e) { failures.push(`loop exception: ${String(e && e.stack || e).split("\n").slice(0, 3).join(" | ")}`); setImmediate(finish); } });
  return frames;
};

// ---- run ----
try {
  eval(js);
} catch (e) {
  console.error("BOOT EXCEPTION:", e);
  process.exit(1);
}

function interact() {
    const byId = (id) => elsById[id];
    assert(byId("loadStatus").hidden === true, "loadStatus hidden after boot");
    assert(byId("levelName").textContent.length > 0, `levelName set (${byId("levelName").textContent})`);
    // difficulty select
    const diffs = queryCache[".difficulty-choice"];
    fire(diffs[2], "click"); // hard
    assert(byId("difficultyRules").textContent.includes("2 vidas"), `rules update on select (${byId("difficultyRules").textContent.slice(0, 40)}…)`);
    assert(diffs[2]._attrs["aria-pressed"] === "true", "aria-pressed syncs on difficulty");
    // world select
    const worlds = queryCache[".world-choice"];
    const juarez = worlds.find((b) => b.dataset.world === "juarez");
    fire(juarez, "click");
    // character select
    const chars = queryCache[".character-choice"];
    const hero = chars.find((b) => b.dataset.role === "hero" && b.dataset.character === "nana");
    fire(hero, "click");
    assert(hero._attrs["aria-pressed"] === "true", "aria-pressed syncs on character");
    // start game
    fire(byId("startButton"), "click");
    assert(!byId("introScreen").classList.contains("hidden"), "intro shows on start");
    fire(byId("skipIntroButton"), "click");
    assert(byId("introScreen").classList.contains("hidden"), "intro closes on skip");
    assert(byId("levelName").textContent.includes("·"), `stage started (${byId("levelName").textContent})`);
    // pause + resume
    fire(byId("pauseButton"), "click");
    fire(byId("pauseButton"), "click");
    // help open/close
    if (byId("helpButton")) { fire(byId("helpButton"), "click"); fire(byId("helpCloseButton"), "click"); }
}

function finish() {
  if (finished) return;
  finished = true;
  setTimeout(report, 80);
}
function report() {
  try {
    assert(frames >= MAX_FRAMES, `ran ${frames} gameplay frames without exceptions`);
    assert(elsById["srStatus"].textContent.length > 0, `srStatus announced (${elsById["srStatus"].textContent.slice(0, 50)}…)`);
  } catch (e) {
    failures.push(`finish exception: ${String(e && e.stack || e).split("\n").slice(0, 2).join(" | ")}`);
  }
  console.log(failures.length ? `\nSMOKE FAIL (${failures.length})` : `\nSMOKE PASS (${frames} frames)`);
  for (const f of failures) console.log(" -", f);
  process.exit(failures.length ? 1 : 0);
}
