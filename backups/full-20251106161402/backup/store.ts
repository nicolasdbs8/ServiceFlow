import {
  store as legacyStore,
  SPML_CODES as LEGACY_SPML_CODES,
  ensureSeatShape as legacyEnsureSeatShape,
  seatObj as legacySeatObj,
  storageKey as legacyStorageKey,
  sumSPML as legacySumSPML,
  sumPRE as legacySumPRE,
  rightCols as legacyRightCols,
} from "../../legacy";

export type FlightPhase = "fiche" | "aperitif" | "repas" | "tc";

export interface SeatAllocation {
  normalKey: string | null;
  spmlCode: string | null;
  preLabel: string | null;
}

export interface SeatApDrink {
  cat: string;
  [key: string]: string | boolean | number | null;
}

export interface SeatServedState {
  aperitif: unknown;
  meal: unknown;
  mealNone?: boolean;
  tc: number | null;
  trayUsed: boolean;
  trayCleared: boolean;
}

export interface SeatState {
  occupied: boolean;
  type: string;
  status: string;
  lang: string;
  notes: string;
  sleep: boolean;
  spml: string;
  preLabel: string;
  normalMeal: string;
  aperoNotes: string;
  tcNotes: string;
  eatWith: string;
  serveLaterAt: number | null;
  alloc: SeatAllocation;
  served: SeatServedState;
  apDrink: SeatApDrink;
  [key: string]: unknown;
}

export interface StoreTitle {
  flightNo: string;
  date: string;
}

export interface StoreConfig {
  rowsBiz: number;
  layout: "A220" | "A320" | string;
  lang: "EN" | "FR" | "DE" | string;
  theme: "dark" | "light" | string;
  histAsc: boolean;
  clientView?: boolean;
}

export interface InventoryState {
  plateaux: number;
  hot_viande: number;
  hot_vege: number;
  hot_special: number;
  spml: Record<string, number>;
  pre: Record<string, number>;
}

export interface ReminderState {
  key: string;
  at: number | null;
}

export interface HistoryEvent {
  ts?: number;
  type: string;
  [key: string]: unknown;
}

export interface StoreState {
  title: StoreTitle;
  config: StoreConfig;
  inventory: InventoryState;
  menu: {
    viandeLabel: string;
    vegeLabel: string;
  };
  seats: Record<string, SeatState>;
  phase: FlightPhase;
  reminders: ReminderState[];
  history: HistoryEvent[];
  clientView: boolean;
}

export const SPML_CODES = LEGACY_SPML_CODES as ReadonlyArray<string>;
export const store = legacyStore as StoreState;

export const ensureSeatShape = legacyEnsureSeatShape as (seat: Partial<SeatState> | undefined) => SeatState;
export const seatObj = legacySeatObj as (row: number, col: string) => SeatState;
export const storageKey = legacyStorageKey as () => string;
export const sumSPML = legacySumSPML as () => number;
export const sumPRE = legacySumPRE as () => number;
export const rightCols = legacyRightCols as () => string[];

export function collectCurrentState(): StoreState {
  if (typeof structuredClone === "function") {
    return structuredClone(store) as StoreState;
  }
  return JSON.parse(JSON.stringify(store)) as StoreState;
}

export function restoreState(snapshot: StoreState): void {
  const clone = typeof structuredClone === "function"
    ? (structuredClone(snapshot) as StoreState)
    : (JSON.parse(JSON.stringify(snapshot)) as StoreState);

  store.title.flightNo = clone.title?.flightNo ?? "";
  store.title.date = clone.title?.date ?? "";

  Object.assign(store.config, clone.config ?? {});

  store.inventory.plateaux = clone.inventory?.plateaux ?? 0;
  store.inventory.hot_viande = clone.inventory?.hot_viande ?? 0;
  store.inventory.hot_vege = clone.inventory?.hot_vege ?? 0;
  store.inventory.hot_special = clone.inventory?.hot_special ?? 0;
  store.inventory.spml = { ...(clone.inventory?.spml ?? {}) };
  store.inventory.pre = { ...(clone.inventory?.pre ?? {}) };

  store.menu.viandeLabel = clone.menu?.viandeLabel ?? "";
  store.menu.vegeLabel = clone.menu?.vegeLabel ?? "";

  store.phase = clone.phase ?? "fiche";
  store.clientView = Boolean(clone.clientView);

  store.reminders = Array.isArray(clone.reminders) ? [...clone.reminders] : [];
  store.history = Array.isArray(clone.history) ? [...clone.history] : [];

  Object.keys(store.seats).forEach((key) => {
    delete store.seats[key];
  });

  const seatEntries = clone.seats ?? {};
  for (const [seatKey, seatValue] of Object.entries(seatEntries)) {
    store.seats[seatKey] = ensureSeatShape(seatValue as SeatState);
  }
}

export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const alreadyPersisted = await navigator.storage.persisted();
      if (!alreadyPersisted) {
        await navigator.storage.persist();
      }
    }
  } catch (error) {
    console.warn("Persistent storage request failed:", error);
  }
}
