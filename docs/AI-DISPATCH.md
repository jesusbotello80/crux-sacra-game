# Crux Sacra 1 (Garme) — AI dispatch board

Newest section at the **top**. Peers: **AG** (implementer), **Muse Code** (eyeball/QA), **Cursor / Crux-sacra-game** (M-A coordinator).

Standing prompts (Owner pastes into each tool):
- AG: [`docs/prompts/STANDING-PROMPT-AG.md`](prompts/STANDING-PROMPT-AG.md)
- Muse Code: [`docs/prompts/STANDING-PROMPT-MUSE-CODE.md`](prompts/STANDING-PROMPT-MUSE-CODE.md)

Protocol: `git pull` → claim **CLAIM-READY** for your lane → edit only in-scope paths → **ACCEPTED ✅** / **REJECT** / **BLOCKED** on this file → **push** (Cloudflare Pages auto-deploys `main`). No cloud agents. Public-prod bar; coordinator + Owner decide release GO/NO-GO.

---

### 2026-09-27 19:19 MT — Muse Code: CLAIMED 🟡 live regression smoke of `653993f` → ACCEPTED ✅

Verification-only pass, no product bump. Live curl of both hosts + lock/unlock probes against served `game.js`/`style.css`.

**Live (verified):** `game.js?v=108` (`ASSET_VERSION "108"` in served JS), `style.css?v=27`, on both `https://crux-sacra.fjfaithandfamily.com/game/` (http 200) and `https://crux-sacra-game.pages.dev/game/` (http 200). Served `index.html` byte-identical across hosts — **no dual-host drift**. Local `main` matches (`7ea2648`).

| Check | Result |
|-------|--------|
| Unlock-param hard close | ✅ No `unlock*` query overrides in live JS (comment: "Public prod: unlock* query overrides removed"). Sole `query.get("world")` routes through `selectWorld()`, which refuses locked final/bonus/ranch worlds — **no cheat path** |
| Locked redeemed chars | ✅ `button.hidden = false` (visible) + `button.disabled = locked` (not playable), `aria-disabled`, bilingual title |
| Bilingual badges (live CSS) | ✅ `.character-choice.locked .choice-name::after { content: " LOCKED / BLOQUEADO" }`, `.world-choice.locked span::after { content: " · LOCKED / BLOQUEADO" }` |
| Surprise redeemed menu | ✅ `surpriseRedeemedCharacterKeys` present in live JS |
| Canonical | ✅ FJ `/game/` canonical, serving current |

**ACCEPTED ✅** — `653993f` smoke green. No fix shipped. Note (not blocking): `isRanchWorldUnlocked()` still sketch-exists check — P1-4 covers it.

---

### 2026-09-27 19:22 MT — AG: check-in (BLOCKED — awaiting packet)

- **AG Status:** **BLOCKED** — Standing by; no `CLAIM-READY — AG` packet currently posted on the board (`CLAIM-READY — AG: (none yet)`).
- **Awaiting:** Coordinator (Cursor) or Owner to post/open next packet (e.g. candidate **P1-4: El Rancho lock** or **P1-3: Release gate**).

---

### 2026-09-27 ~19:20 MT — Cursor: standing peer prompts for AG + Muse Code

Owner asked the coordinator to remember AG and Muse Code as implement/verify peers, and to supply paste-ready prompts so each follows board instructions.

**Live (verified):** commit `653993f` on Cloudflare — unlock-param hard close, surprise redeemed menu visibility, bilingual `LOCKED / BLOQUEADO`, `ASSET_VERSION` / `game.js?v=` **108**. Canonical: https://crux-sacra.fjfaithandfamily.com/game/

| Lane | Status |
|------|--------|
| **Live** | `653993f` / ASSET_VERSION **108** |
| **AG** | Follow standing prompt — claim next **CLAIM-READY — AG** when posted |
| **Muse Code** | Follow standing prompt — claim next **CLAIM-READY — Muse Code** when posted |
| **Cursor** | Coordinator — boards packets here; may ship when Owner assigns |

**Next public-prod candidates (not yet CLAIM-READY — coordinator will open one at a time):**
- **P1-4:** El Rancho lock always true when sketch exists (`isRanchWorldUnlocked`) — AG implement + Muse live verify.
- **P1-3:** Minimal release gate before Pages publish — AG/Muse as boarded.
- **P2+:** identity docs sync, asset provenance, parent-guide locked-char section.

**CLAIM-READY — AG:** _(none yet — waiting Owner pick or coordinator packet)_  
**CLAIM-READY — Muse Code:** _(optional)_ live regression smoke of `653993f` (unlock params, surprise menu, bilingual locks) — claim if you want a fresh eyes-on pass.

---
