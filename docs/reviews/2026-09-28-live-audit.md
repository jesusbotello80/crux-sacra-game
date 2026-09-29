# Crux Sacra 1 (Garme / Classic) — Post-Deploy Live Verification Audit

- **Date:** 2026-09-28 20:15 MT
- **Auditor:** Muse Code (Gates / Presentation / Live Eyeball Peer)
- **Status:** **ACCEPTED ✅** (Evidence recorded for Coordinator & Owner)
- **Scope:** Full post-deploy live verification across Canonical and Pages.dev hosts

---

## 1. Target Hosts & Deployment Status

| Host | URL | HTTP Status | Response |
|------|-----|-------------|----------|
| **Canonical** | `https://crux-sacra.fjfaithandfamily.com/game/` | `200 OK` | Deployed & Active |
| **Pages.dev** | `https://crux-sacra-game.pages.dev/game/` | `200 OK` | Deployed & Active |
| **Root Canonical** | `https://crux-sacra.fjfaithandfamily.com/` | `302 Found` | Redirects to `/game/` |
| **Root Pages** | `https://crux-sacra-game.pages.dev/` | `302 Found` | Redirects to `/game/` |

---

## 2. Asset Integrity & Hash Verification

Probing endpoints across both hosts against local source files:

| File / Endpoint | Canonical SHA-256 | Pages.dev SHA-256 | Local SHA-256 | Integrity Status |
|-----------------|-------------------|-------------------|---------------|------------------|
| `game.js?v=109` | `c3dbaac8b9dd0c0fce5e46d0a5fce4c3ca0f5f5cb65c63f4966fb7d0799d27bd` | `c3dbaac8b9dd0c0fce5e46d0a5fce4c3ca0f5f5cb65c63f4966fb7d0799d27bd` | `c3dbaac8b9dd0c0fce5e46d0a5fce4c3ca0f5f5cb65c63f4966fb7d0799d27bd` | **Byte-identical across all three** |
| `style.css?v=27` | `e7870aa7cd228c8204fd2493ac8be9bce24dba5284046faae223334e92cbbaf5` | `e7870aa7cd228c8204fd2493ac8be9bce24dba5284046faae223334e92cbbaf5` | `e7870aa7cd228c8204fd2493ac8be9bce24dba5284046faae223334e92cbbaf5` | **Byte-identical across all three** |
| `index.html` | `71e213df25e505e9dcd78d56145d0dd4fd7161d484b17ef4eedc24dc9386e258` | `38cee6000ef8c627149ca2c7e364047d59d0339f9ef5afa5cf5f32b1bf3026d1` | `38cee6000ef8c627149ca2c7e364047d59d0339f9ef5afa5cf5f32b1bf3026d1` | **Pages matches Local 1:1**; Canonical contains Cloudflare Web Analytics beacon injection at closing `</body>`. Zero application drift. |

---

## 3. Security, Guard Flags & Gameplay Gating Verification

1. **In-game Help Modal (Live `index.html`):**
   - Verified present on both hosts:
     ```html
     <li><strong>El Rancho:</strong> La Aparecida de la Carretera sends road dust ribbons and phantom lanterns. (Locked until public release / Bloqueado hasta el lanzamiento público.)</li>
     ```
   - Matches family/parent guide documentation and preserves locked state messaging.

2. **Ranch Guard Flag (Live `game.js`):**
   - Verified exact definition:
     ```javascript
     const ranchWorldPublicReady = false;
     ```
   - `finalWorldRequiredKeys` excludes `elrancho` while `ranchWorldPublicReady` remains `false`.

3. **URL Parameter Cheat Resistance & World Gating:**
   - Probed `?world=elrancho`: `applyInitialWorldFromQuery()` delegates to `selectWorld("elrancho")`.
   - `selectWorld` checks `isRanchWorldUnlocked()`, which evaluates `ranchWorldPublicReady && Boolean(worldSketches[ranchWorldKey])` -> returns `false`.
   - The game rejects world switch to `elrancho`, falling back safely to `"colorado"`, while keeping the El Rancho selection button locked and disabled.
   - Forbidden query override tokens (`unlockFinal`, `unlockBonus`, `unlockRanch`) are completely absent from served code.

4. **Bilingual Locked Badges & Input Prevention:**
   - Served `style.css` contains:
     ```css
     .character-choice.locked .choice-name::after {
       content: " LOCKED / BLOQUEADO";
       display: block;
       margin-top: 3px;
       font-size: 9px;
       letter-spacing: 0;
       color: rgba(255, 249, 220, 0.78);
     }

     .world-choice.locked span::after {
       content: " · LOCKED / BLOQUEADO";
       font-size: 10px;
       letter-spacing: 0;
       color: rgba(255, 249, 220, 0.78);
     }
     ```
   - Both redeemed character buttons and unearned/locked world buttons receive `disabled`, `locked`, and `aria-disabled="true"` in the DOM with `cursor: not-allowed; opacity: 0.38; filter: grayscale(1);`, precluding selection while locked.

---

## 4. Local Release Gate (`npm run gate`)

Command output:
```text
> gate
> node scripts/release-gate.mjs

[PASS] Crux Sacra release gate passed.
       ASSET_VERSION: 109
       Cache query:   ./game.js?v=109
       Guards:        ranchWorldPublicReady present, unlock cheats absent
       Badges:        LOCKED / BLOQUEADO present
```

---

## 5. Audit Verdict

- **Release Bar:** Public Prod
- **Audit Outcome:** **ACCEPTED ✅**
- **Evidence:** Both live hosts strictly serve consistent, cheat-free, guarded assets aligned with repository `main` (`9d466c6` / `f9cbb3b`).
