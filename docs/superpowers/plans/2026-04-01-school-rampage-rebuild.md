# School Rampage Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the game shell, UI flow, and architecture around the current shipped gameplay without regressing the playable core.

**Architecture:** Build a new static-module application shell with explicit scenes (`home`, `loadout`, `battle`, `results`), a shared state container, and focused UI modules. Keep the current battle logic alive behind a bridge layer first, then migrate systems incrementally into the new module layout.

**Tech Stack:** Static HTML, CSS variables, vanilla JavaScript ES modules, Canvas 2D, localStorage

---

### Task 1: Create the new app skeleton

**Files:**
- Create: `src/app/bootstrap.js`
- Create: `src/app/router.js`
- Create: `src/app/state/store.js`
- Create: `src/app/config/design-tokens.js`
- Modify: `index.html`

- [ ] Step 1: Add an ES module entrypoint in `index.html`
- [ ] Step 2: Create a minimal `bootstrap.js` that mounts the app shell
- [ ] Step 3: Create a tiny router with `home/loadout/battle/results`
- [ ] Step 4: Create a shared store for `metaState`, `runState`, and `uiState`
- [ ] Step 5: Verify the new shell renders before any battle migration

### Task 2: Build the redesign system and screen shell

**Files:**
- Create: `src/styles/base.css`
- Create: `src/styles/layout.css`
- Create: `src/styles/components.css`
- Create: `src/ui/screens/home-screen.js`
- Create: `src/ui/screens/loadout-screen.js`
- Create: `src/ui/screens/battle-screen.js`
- Create: `src/ui/screens/results-screen.js`

- [ ] Step 1: Define the “hot-blooded arcade campus” token system
- [ ] Step 2: Build the new homepage shell
- [ ] Step 3: Build the loadout page shell
- [ ] Step 4: Build the battle HUD shell
- [ ] Step 5: Build the results shell

### Task 3: Extract content data from the legacy game

**Files:**
- Create: `src/data/characters.js`
- Create: `src/data/weapons.js`
- Create: `src/data/enemies.js`
- Create: `src/data/bosses.js`
- Create: `src/data/items.js`
- Create: `src/data/upgrades.js`
- Modify: `js/game.js`

- [ ] Step 1: Move static character data into `src/data/characters.js`
- [ ] Step 2: Move weapon data into `src/data/weapons.js`
- [ ] Step 3: Move enemy and boss data into dedicated files
- [ ] Step 4: Move item and upgrade definitions out of the legacy file
- [ ] Step 5: Replace direct literals with imports or bridge adapters

### Task 4: Bridge the legacy battle loop into the new battle scene

**Files:**
- Create: `src/bridge/legacy-game-bridge.js`
- Modify: `src/ui/screens/battle-screen.js`
- Modify: `js/game.js`

- [ ] Step 1: Wrap the existing start / stop / result hooks behind a bridge
- [ ] Step 2: Mount the legacy canvas into the new battle screen container
- [ ] Step 3: Pipe battle lifecycle events into the new store
- [ ] Step 4: Route game over into the new results screen
- [ ] Step 5: Verify the game is still fully playable through the new UI flow

### Task 5: Rebuild HUD and loadout interaction around weapons and items

**Files:**
- Create: `src/ui/components/hud-bars.js`
- Create: `src/ui/components/hud-build-strip.js`
- Create: `src/ui/components/hud-item-bar.js`
- Create: `src/ui/components/weapon-selection.js`
- Modify: `src/ui/screens/loadout-screen.js`
- Modify: `src/ui/screens/battle-screen.js`

- [ ] Step 1: Display main weapon, sub weapon, and build tags clearly
- [ ] Step 2: Reframe items as random pickup consumables only
- [ ] Step 3: Surface boss, wave, and pickup feedback in the HUD
- [ ] Step 4: Improve mobile-readable layout and touch-safe spacing
- [ ] Step 5: Verify battle readability on desktop and mobile widths

### Task 6: Modularize battle systems incrementally

**Files:**
- Create: `src/systems/player-system.js`
- Create: `src/systems/weapon-system.js`
- Create: `src/systems/enemy-system.js`
- Create: `src/systems/drop-system.js`
- Create: `src/systems/wave-system.js`
- Create: `src/systems/meta-progression-system.js`
- Modify: `js/game.js`

- [ ] Step 1: Move one self-contained system at a time behind stable interfaces
- [ ] Step 2: Keep the bridge thin and delete migrated logic from the legacy file
- [ ] Step 3: Preserve save compatibility with current localStorage keys
- [ ] Step 4: Re-test full runs after each migrated system
- [ ] Step 5: Stop once `js/game.js` is no longer the product shell

### Task 7: Finalize docs and release notes

**Files:**
- Modify: `ARCHITECTURE.md`
- Modify: `CHANGELOG.md`
- Modify: `QA_TEST_REPORT.md`

- [ ] Step 1: Update architecture to describe the new module layout
- [ ] Step 2: Update changelog to reflect the rebuild milestone
- [ ] Step 3: Refresh QA notes around the new UI flow
- [ ] Step 4: Record known migration gaps
- [ ] Step 5: Prepare the next-phase migration backlog
