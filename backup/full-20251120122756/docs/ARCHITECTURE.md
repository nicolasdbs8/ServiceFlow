# SwissServiceFlow Architecture (Phase 4bis)

## Runtime Overview
- `index.html` only defines the shell markup and links the compiled stylesheet (`/src/styles/globals.css`) and the entry bundle (`/src/app/main.ts`).
- `src/app/main.ts` bootstraps the application: requests persistent storage, installs the storage proxy, initialises the modular sections (header, seat map, passengers, meals) and then calls the legacy compatibility layer.
- `src/legacy.ts` still holds the legacy business logic; it is now treated as a compatibility shim (`@ts-nocheck`) that will be carved up feature-by-feature.

## Modules
- `src/components/*`
  - `header`, `seat-map`, `passengers`, `meals` expose thin initialisers that wire legacy behaviour to the new component layout and load component-scoped styles.
- `src/styles/globals.css`
  - Consolidated stylesheet extracted from the monolithic HTML `<style>` block; component placeholders live in `src/styles/components/`.
- `src/features/flights/store.ts`
  - Provides typed access to the (legacy) flight store, snapshot helpers, and metadata utilities.
- `src/features/flights/services/*`
  - `db.ts` implements the IndexedDB wrapper with a localStorage fallback.
  - `persistence.ts` patches Storage APIs to persist snapshots and migrate legacy data.
  - `menu-loader.ts` remains a stub awaiting real menu feeds.
- `src/features/flights/hooks/useAutosave.ts`
  - Debounced autosave hook that invokes `persistCurrentState()` via the new store facade.
- `src/features/i18n/locales/index.ts`
  - Houses the legacy translation dictionary outside of `legacy.ts` (ts-nocheck, slated for future modularisation).
- `src/utils/dom.ts`
  - Shared DOM helpers retained from the legacy implementation.

## Public Assets
- `public/manifest.json`, `public/sw.js`, and `public/icons/*` remain the PWA surface.
- `public/data/menus/*` contains placeholder payloads for quarterly menu packs.

## Next Migration Steps
1. Move seat-map rendering, drink grid logic, and reminder scheduling out of `legacy.ts` into dedicated feature modules.
2. Replace the legacy store shim with a fully typed state implementation (e.g., Zustand/Redux slice) and update all consumers.
3. Introduce a real i18n layer that consumes the extracted locale files and removes direct dictionary access from the legacy shim.
