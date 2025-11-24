import { store as legacyStore, SPML_CODES as LEGACY_SPML_CODES, ensureSeatShape as legacyEnsureSeatShape, seatObj as legacySeatObj, storageKey as legacyStorageKey, sumSPML as legacySumSPML, sumPRE as legacySumPRE, rightCols as legacyRightCols, } from "../../legacy";
export const SPML_CODES = LEGACY_SPML_CODES;
export const store = legacyStore;
export const ensureSeatShape = legacyEnsureSeatShape;
export const seatObj = legacySeatObj;
export const storageKey = legacyStorageKey;
export const sumSPML = legacySumSPML;
export const sumPRE = legacySumPRE;
export const rightCols = legacyRightCols;
export function collectCurrentState() {
    if (typeof structuredClone === "function") {
        return structuredClone(store);
    }
    return JSON.parse(JSON.stringify(store));
}
export function restoreState(snapshot) {
    const clone = typeof structuredClone === "function"
        ? structuredClone(snapshot)
        : JSON.parse(JSON.stringify(snapshot));
    store.title.flightNo = clone.title?.flightNo ?? "";
    store.title.date = clone.title?.date ?? "";
    Object.assign(store.config, clone.config ?? {});
    store.inventory.plateaux = clone.inventory?.plateaux ?? 0;
    store.inventory.hot_viande = clone.inventory?.hot_viande ?? 0;
    store.inventory.hot_vege = clone.inventory?.hot_vege ?? 0;
    store.inventory.hot_special = clone.inventory?.hot_special ?? 0;
    store.inventory.spml = { ...(clone.inventory?.spml ?? {}) };
    store.inventory.pre = { ...(clone.inventory?.pre ?? {}) };
    store.menu.mode = clone.menu?.mode ?? "auto";
    store.menu.direction =
        clone.menu?.direction === "inbound" || clone.menu?.direction === "outbound"
            ? clone.menu.direction
            : null;
    store.menu.serviceType =
        clone.menu?.serviceType === "day" || clone.menu?.serviceType === "breakfast"
            ? clone.menu.serviceType
            : null;
    store.menu.breakfastType =
        clone.menu?.breakfastType === "nightstop" || clone.menu?.breakfastType === "standard"
            ? clone.menu.breakfastType
            : "standard";
    store.menu.rotation =
        typeof clone.menu?.rotation === "number" ? clone.menu.rotation : null;
    store.menu.viandeLabel = clone.menu?.viandeLabel ?? "";
    store.menu.vegeLabel = clone.menu?.vegeLabel ?? "";
    store.menu.manualViandeLabel =
        clone.menu?.manualViandeLabel ?? clone.menu?.viandeLabel ?? "";
    store.menu.manualVegeLabel =
        clone.menu?.manualVegeLabel ?? clone.menu?.vegeLabel ?? "";
    store.menu.autoViandeLabel = clone.menu?.autoViandeLabel ?? "";
    store.menu.autoVegeLabel = clone.menu?.autoVegeLabel ?? "";
    store.menu.autoStatus = clone.menu?.autoStatus ?? "";
    store.menu.autoNote = clone.menu?.autoNote ?? "";
    store.phase = clone.phase ?? "fiche";
    store.clientView = Boolean(clone.clientView);
    store.reminders = Array.isArray(clone.reminders) ? [...clone.reminders] : [];
    store.history = Array.isArray(clone.history) ? [...clone.history] : [];
    Object.keys(store.seats).forEach((key) => {
        delete store.seats[key];
    });
    const seatEntries = clone.seats ?? {};
    for (const [seatKey, seatValue] of Object.entries(seatEntries)) {
        store.seats[seatKey] = ensureSeatShape(seatValue);
    }
}
export async function requestPersistentStorage() {
    try {
        if (navigator.storage && navigator.storage.persist) {
            const alreadyPersisted = await navigator.storage.persisted();
            if (!alreadyPersisted) {
                await navigator.storage.persist();
            }
        }
    }
    catch (error) {
        console.warn("Persistent storage request failed:", error);
    }
}
