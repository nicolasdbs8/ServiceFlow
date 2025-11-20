# Phase 1 - Audit & Extraction (SwissServiceFlow)

## 1. Overview
- Single file app (`basedoc.html`) mixing HTML, CSS, and JavaScript.
- One inline `<script>` holds every state (`store`), rendering routine (seat map, service flow), form handler (header, modal), localisation, and service logic.
- No external libraries or CDN references; relies solely on Web APIs.
- Legacy PWA hooks already present: `<link rel="manifest" href="./manifest.webmanifest">` and `navigator.serviceWorker.register("./sw.js")`, but no project structure behind them.

## 2. Main DOM Structure
- **Header** (`header .wrap`): client mode toggle, flight/date inputs (`#flightNo`, `#flightDate`, `#flightDateISO`), actions (save, import/export, reset), language dropdown (`#langDropdown`), theme toggle (`#themeToggle`), phase chips (`#phaseChips`), flight filter (`#filterSelect`).
- **Left aside** (`aside`): cabin config (`#layoutSelect`, `#rowsBizMinus/Plus`, `#rowsBizDisplay`), meal labels (`#labelViande`, `#labelVege`), inventory grids (`#inv`, `#spmlInv`, `#preInv`) plus buttons `[data-inv]`, `#spmlAdd*`, `#preAdd*`.
- **Main column**: seat map container (`#seatmapTitle`, `#seatgrid`) with legend, history section (`#historySection`, filters `#histMode`, `#histSeat`, `#histType`), service flow sidebar (`#flowAside`, lists `#flowLater`, `#flowNow`, `#flowClear`, reminders `#remindersList`).
- **Modal** (`#modalBack > .modal`): passenger form (`#m_*` inputs), phase navigation (`#modalPhaseNav`), meal block (`#mealBlock`), drink grid (`#drinkGrid` and sub-options), notes, action buttons (serve, later, clear, move pax, sleep, etc.).

## 3. Global State and Shared Objects
- `store` (global, `basedoc.html:1084`):
  - `title`: `flightNo`, `date`
  - `config`: `rowsBiz`, `layout`, `lang`, `theme`, `histAsc`, `clientView`
  - `inventory`: counters (`plateaux`, `hot_viande`, `hot_vege`, `hot_special`, `spml{}`, `pre{}`)
  - `menu`: `viandeLabel`, `vegeLabel`
  - `seats`: dictionary keyed by seat (e.g. `4C`)
  - `phase`: `"fiche" | "aperitif" | "repas" | "tc"`
  - `reminders`: pending reminders (seat key + timestamp)
  - `history`: newest-first event log
- `ensureSeatShape` (`basedoc.html:2120`) normalises seat records: occupancy, pax type flag, status tags (HON/SEN/FTL), meal/SPML/preorder choices, notes (aperitif, tea/coffee), service state (`served`, `trayCleared`, `serveLaterAt`), and `apDrink` detail structure.
- Other globals:
  - `drinkSel` (`basedoc.html:1311`): current drink grid selection.
  - `modalSeat` (`basedoc.html:4495`): active seat data in modal.
  - `movingFrom` (`basedoc.html:5210`): tracking seat move operations.
  - `I18N` (`basedoc.html:2371`) and `I18N_BINDINGS` (`basedoc.html:3424`) plus `applyI18n`.
  - Helper flags: `window.__DRINK_GRID_BOUND`, `window.__importingJSON`, `window._rerenderDatepickerLang`.

## 4. Key Functions (by concern)
### Utilities & Persistence
- `save()`, `storageKey()`, `loadKeyData()`, `switchStorageIfTitleChanged()` (`basedoc.html:2172-2215`) manage localStorage snapshots.
- Autosave hooks on `visibilitychange`, `pagehide`, `beforeunload` (`basedoc.html:2189-2205`).
- `onSaveTitleSnapshot` and header bindings (`basedoc.html:2217-2313`).
- JSON import/export via `#saveSnapshot`, `#importJSON` with optional `normalizeImportedStore`.
- `syncUIToStoreForExport()` (`basedoc.html:7280`) ensures form values are flushed before export.

### Flight Header & Date
- Date picker IIFE (`basedoc.html:1104-1305`) with helpers `dpLocale`, `openDP`, `renderDP`, `parseISO`, `today`, `toISO`.
- `fmtDateLocalized()` and `updateFlightDatePretty()` refresh visible date (`basedoc.html:2291`).
- `initLangButtons()`, `applyTheme()`, top-level `init()` bootstrap (`basedoc.html:6512-6946`).

### Inventory & Cabin Config
- `refreshBadges()` (`basedoc.html:3555`), `renderPreInventory()` (`basedoc.html:3604`), `adjInv()` adjust counts, plus derived summaries (`sumSPML`, `sumPRE`).
- Inline handlers for SPML/preorder additions and +/- buttons (`basedoc.html:6600-6640`).

### Seat Map & Passengers
- `renderSeatmap()` and `renderSeatCell()` (`basedoc.html:3945-4359`) draw the grid based on layout and rows.
- Modal workflow: `openSeatModal()`, `populateModalOptions()`, `arrangeModalByPhase()`, `writeTcToUI()`, `readTcFromUI()`, `persistModal()`, `closeSeatModal()` (`~basedoc.html:4497-5098`).
- Seat move tools: `setMoveUI()`, `startSeatMove()`, `performMoveOrSwap()`, `quickToggleSleep()`, `updateSleepButtons()` (`basedoc.html:5209-5467`).
- Reminders: `scheduleReminderFor()`, `setLaterButtonState()`, `renderReminders()` with 1-second `setInterval` (`basedoc.html:6070-6172`).

### Meal & Drink Management
- Drink grid module: `initDrinkGrid()`, `renderOptionsFor()`, `showAllDrinkGroups()`, `focusDrinkGroup()`, `updateServeDrinkButtons()`, `resetDrinkUI()` (`basedoc.html:1310-2088`).
- Seat meal handling: `setNormalChoice()`, `setSpmlChoice()`, `setPreChoice()`, `updateServeMealButtonState()`, event handlers for serve/don't serve, tray clearing (`basedoc.html:3235-5790`).
- Drink history helpers: `summarizeApDrink()`, `updateMealDrinkInline()`, `updateTCInline()`, `lastMealDrinkEventForSeat()` etc. (`basedoc.html:5600-5785`, `7100+`).
- Cocktail tooltips via `COCKTAIL_TIPS`, `_fillTip`, `_showTipButton` (`basedoc.html:6987-7066`).

### History & Service Flow
- `renderHistory()`, `rebuildHistSeatSelect()`, `updateHistoryControls()` (`basedoc.html:3280-3530`).
- `computeServiceFlow()`, `mealChoiceTagHTML()`, `groupEatWith()`, `renderServiceFlow()` populate the right-hand cards (`basedoc.html:6184-6467`).
- `addHistory()` / `addHistoryEvt()` plus `migrateHistoryToEvents()` for legacy data (`basedoc.html:2320`, `6860`).

### Initialisation & Utilities
- Global IIFE `init()` (`basedoc.html:6897-6946`) normalises state, restores inputs, re-renders seat map/history/service flow, binds listeners.
- `ensureLegalBanner()` (called on DOMContentLoaded) injects right-to-use notice.
- Misc utilities: `addClickAndTouchListener()`, `nowStr()`, `keyFor()`, `rightCols()`, `updateSeatmapTitle()`, `playBeep()`.

## 5. Storage Usage
- `localStorage` keys:
  - `serviceflow::${flightNo}::${date}` - full serialized `store`.
  - `serviceflow::lastKey` - remembers last saved session.
  - Legacy read of `cabinboard::` prefix for backward compatibility (`basedoc.html:6911`).
- `navigator.storage.persist()` requested to keep storage quota when possible.
- No IndexedDB yet; all persistence is localStorage based.

## 6. Network & File Interactions
- No `fetch` calls or remote dependencies; menus and data are entered manually.
- JSON import/export handled with `FileReader`, `Blob`, and `URL.createObjectURL`.
- Service worker registration expects `./sw.js` at root (currently missing).
- Existing manifest reference targets `./manifest.webmanifest` (also absent in repo).

## 7. Web APIs in Use
- DOM APIs: `addEventListener`, `querySelector`, dataset/classList manipulations.
- Storage APIs: `localStorage`, `navigator.storage`.
- Media: `AudioContext` for beep notifications.
- File APIs: `FileReader`, `Blob`, `URL.createObjectURL`.
- Timers: `setTimeout`, `setInterval`.
- Misc: `window.alert`, `window.confirm`, `navigator.serviceWorker`.

## 8. Refactor Notes
- Heavy reliance on globals (`store`, `modalSeat`, `drinkSel`) must be modularised into scoped modules.
- Candidate `initXxxSection()` splits:
  1. `initFlightFormsSection` - header inputs, date picker, language/theme, import/export.
  2. `initAirportSection` - cabin layout controls and seat map rendering.
  3. `initPassengersSection` - modal logic, seat movement, reminders.
  4. `initMealSection` - inventory, meal/drink workflow, service flow, history.
- `collectCurrentState()` is not implemented; required for future export/autosave abstraction.
- `normalizeImportedStore` is referenced but undefined here; confirm existence before TypeScript migration.
- Current service worker/manifest references must be replaced with new Vite-friendly versions.
- Icons referenced in `<head>` (`./icons/*.png`, `./icon-512.png`, etc.) need relocation into `public/icons/`.
- Localisation dictionary (`I18N`) is large but self-contained, ready for extraction into a TypeScript module.

## 9. Risks & Migration Considerations
- Preserve `store.history` behaviour (mix of text and structured events) and keep `migrateHistoryToEvents()` semantics.
- Many cascading refresh calls (`renderSeatmap`, `renderServiceFlow`, `updateServeDrinkButtons`) rely on execution order; take care when splitting modules.
- DOM IDs/classes must remain unchanged to respect requirement on visual structure.
- Reminder loop runs continuously; ensure it is reinitialised once in the modular entry point.
- `ALWAYS_FRESH_START` constant is hard-coded to `true`; if historic sessions should auto-restore, this flag will need review.
- Emoji icons in markup rely on UTF-8; verify they survive build tooling once files are split.
