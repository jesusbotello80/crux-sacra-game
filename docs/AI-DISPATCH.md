# Crux Sacra 1 (Garme) — AI dispatch board

Newest section at the **top**. Peers: **AG** (implementer), **Muse Code** (eyeball/QA), **Cursor / Crux-sacra-game** (M-A coordinator).

Standing prompts (Owner pastes into each tool):
- AG: [`docs/prompts/STANDING-PROMPT-AG.md`](prompts/STANDING-PROMPT-AG.md)
- Muse Code: [`docs/prompts/STANDING-PROMPT-MUSE-CODE.md`](prompts/STANDING-PROMPT-MUSE-CODE.md)

Protocol: `git pull` → claim **CLAIM-READY** for your lane → edit only in-scope paths → **ACCEPTED ✅** / **REJECT** / **BLOCKED** on this file → **push** (Cloudflare Pages auto-deploys `main`). No cloud agents. Public-prod bar; coordinator + Owner decide release GO/NO-GO.

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
