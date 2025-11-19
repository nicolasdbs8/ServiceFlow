import { saveFlight, loadFlight, setLastFlightKey, getLastFlightKey, listFlightKeys, deleteFlight, setFallbackStorage } from "./db";
const FLIGHT_PREFIX = "serviceflow::";
const LAST_KEY = `${FLIGHT_PREFIX}lastKey`;
/**
 * Installs a proxy over Storage methods so the legacy code keeps working
 * while persistence happens via IndexedDB.
 */
export async function setupPersistence() {
    if (typeof window === "undefined")
        return;
    const nativeSetItem = Storage.prototype.setItem;
    const nativeRemoveItem = Storage.prototype.removeItem;
    const nativeGetItem = Storage.prototype.getItem;
    const originalStorage = window.localStorage;
    setFallbackStorage(originalStorage);
    // Migrate any existing localStorage snapshots into IndexedDB.
    try {
        for (let i = 0; i < originalStorage.length; i += 1) {
            const key = originalStorage.key(i);
            if (!key)
                continue;
            const value = nativeGetItem.call(originalStorage, key);
            if (!value)
                continue;
            if (key === LAST_KEY) {
                setLastFlightKey(value).catch((error) => console.warn("[persistence] setLastFlightKey failed during migration:", error));
                continue;
            }
            if (isFlightKey(key)) {
                try {
                    const payload = JSON.parse(value);
                    saveFlight(key, payload).catch((error) => console.warn("[persistence] saveFlight failed during migration:", error));
                }
                catch (error) {
                    console.warn("[persistence] migration parse error:", error);
                }
            }
        }
    }
    catch (error) {
        console.warn("[persistence] migration failed:", error);
    }
    // Mirror persisted flights into localStorage so synchronous reads still work.
    try {
        const flightKeys = await listFlightKeys();
        for (const key of flightKeys) {
            if (!isFlightKey(key))
                continue;
            if (!nativeGetItem.call(originalStorage, key)) {
                const data = await loadFlight(key);
                if (data) {
                    nativeSetItem.call(originalStorage, key, JSON.stringify(data));
                }
            }
        }
        const lastKey = await getLastFlightKey();
        if (lastKey) {
            nativeSetItem.call(originalStorage, LAST_KEY, lastKey);
        }
    }
    catch (error) {
        console.warn("[persistence] preload failed:", error);
    }
    Storage.prototype.setItem = function patchedSetItem(key, value) {
        nativeSetItem.call(this, key, value);
        if (key === LAST_KEY) {
            setLastFlightKey(value).catch((error) => console.warn("[persistence] setLastFlightKey failed:", error));
            return;
        }
        if (isFlightKey(key)) {
            try {
                const payload = JSON.parse(value);
                saveFlight(key, payload).catch((error) => console.warn("[persistence] saveFlight failed:", error));
            }
            catch (error) {
                console.warn("[persistence] saveFlight parse error:", error);
            }
        }
    };
    Storage.prototype.removeItem = function patchedRemoveItem(key) {
        nativeRemoveItem.call(this, key);
        if (key === LAST_KEY) {
            setLastFlightKey("").catch(() => { });
            return;
        }
        if (isFlightKey(key)) {
            deleteFlight(key).catch((error) => console.warn("[persistence] deleteFlight failed:", error));
        }
    };
}
function isFlightKey(key) {
    return key.startsWith(FLIGHT_PREFIX) && key !== LAST_KEY;
}
