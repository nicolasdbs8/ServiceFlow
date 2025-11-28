import { initHeader } from "../components/header";
import { initSeatMap } from "../components/seat-map";
import { initPassengers } from "../components/passengers";
import { initMeals } from "../components/meals";
import { requestPersistentStorage, restoreState } from "../features/flights/store";
import { setupPersistence, loadPersistedSnapshot } from "../features/flights/services/persistence";
import { setupAutosaveListeners } from "../features/flights/hooks/useAutosave";
import { bootLegacyApp } from "../legacy";
document.addEventListener("DOMContentLoaded", async () => {
    await requestPersistentStorage();
    await setupPersistence();
    const restored = await loadPersistedSnapshot();
    if (restored) {
        restoreState(restored.snapshot);
    }
    initHeader();
    initSeatMap();
    initPassengers();
    initMeals();
    bootLegacyApp();
    setupAutosaveListeners(document);
});
