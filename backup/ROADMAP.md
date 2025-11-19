# SwissServiceFlow Roadmap

This checklist tracks progress while refactoring the legacy single-file app into a modular Vite + TypeScript PWA.

## Phase 1 - Audit & Extraction
- [x] Review `basedoc.html` and map logical areas (meals, passengers, seat map, header/forms, utilities).
- [x] Catalogue global functions, shared state, and all `localStorage` usage.
- [x] Record external assets, existing PWA hooks, and migration risks (see `docs/PHASE1_AUDIT.md`).

## Phase 2 - Vite Project Skeleton
- [x] Create `package.json` with Vite + TypeScript scripts and add `vite.config.ts`.
- [x] Move markup into `index.html`, stripping inline scripts, add `<script type="module" src="/src/main.ts">`, manifest link, and theme-color meta.
- [x] Scaffold folders: `public/`, `public/data/menus/`, `public/icons/`, `src/`, `src/components/`, `src/utils/`.
- [x] Draft `src/main.ts` and stub `initXxxSection` functions.

## Phase 3 - TypeScript Migration
- [x] Port each logical block into its module (`menu-loader`, `meal-section`, `passengers-section`, `airport-section`, `flight-forms-section`) with typing.
- [x] Move DOM queries/constants inside the new `initXxxSection()` functions and document the modules.
- [x] Extract shared helpers for state collection/restoration and DOM utilities.
- [x] Implement shared `collectCurrentState()` and `restoreState()` helpers.

## Phase 4 - IndexedDB & Autosave
- [x] Implement `src/utils/db.ts` with `saveFlight(id, payload)` / `loadFlight(id)` and error handling.
- [x] Replace every `localStorage` access with the IndexedDB abstraction.
- [x] Add 1.2 s debounce autosave on input/change events within `main.ts`.

## Phase 4bis - Architecture Refactor Guide
- [x] Establish target folder layout (`src/app`, `src/components`, `src/features`, `src/styles`, `src/utils`) and migrate existing files.
- [x] Extract a dedicated flight state store (temporary wrapper around legacy store) and expose typed helpers for snapshots and metadata.
- [x] Move persistence utilities into `features/flights/services/persistence.ts` and expose typed CRUD helpers (`loadFlightState`, `saveFlightState`, `listFlights`).
- [x] Port UI blocks (header, seat map, drink grid, reminders) into isolated components with scoped styles; remove inline `<style>` from `index.html`.
- [x] Consolidate internationalisation strings into locale files and wire the legacy module to the new helper.
- [x] Replace legacy autosave listeners with a reusable hook/service (`useAutosave`) integrated into the new component tree.
- [x] Gradually retire `src/legacy.ts`, retaining it only as a compatibility shim for the new modules.

## Phase 5 - Quarterly Menus
- [ ] Create `public/data/menus/index.json` listing date ranges and paths.
- [ ] Create sample `public/data/menus/2025Q4.json` with dummy meal data.
- [ ] Implement `src/components/menu-loader.ts` (`loadMenuForDate`) with fetch, fallback, and typing.
- [ ] Adjust the meal section to await the loaded menu before rendering.

## Phase 6 - PWA Offline
- [ ] Add `public/manifest.json` with app details and 192/512 icons.
- [ ] Create `public/sw.js` to precache `index.html` and Vite bundles (cache-first strategy).
- [ ] Register the service worker from `index.html`.
- [ ] Verify Vite build copies the service worker and assets as expected.

## Phase 7 - Export / Import (.ssf)
- [ ] Insert export/import controls after the existing Sauvegarder button in `index.html`.
- [ ] Implement export (JSON `.ssf` blob) and import with validation in `main.ts`.
- [ ] Rehydrate imported state via `restoreState()` and restart autosave.

## Phase 8 - iPad & Offline QA
- [ ] Validate touch ergonomics (targets, typography, responsive layout).
- [ ] Test airplane mode: initial load, navigation, IndexedDB restore.
- [ ] Apply fixes as needed (viewport, tablet-specific styles).

## Phase 9 - Cleanup & Documentation
- [ ] Remove unused globals, align naming, and add TypeScript typings.
- [ ] Sprinkle concise comments only where logic is non-obvious.
- [ ] Add npm scripts (`dev`, `build`, `preview`) and usage notes.
- [ ] Run `npm run build` and record the outcome.

