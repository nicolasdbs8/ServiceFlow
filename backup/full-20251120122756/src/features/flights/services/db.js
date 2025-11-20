const DB_NAME = "swiss-serviceflow";
const DB_VERSION = 1;
const FLIGHTS_STORE = "flights";
const META_STORE = "meta";
const LAST_KEY_META = "lastKey";
const FALLBACK_PREFIX = "ssf::flight::";
const FALLBACK_LAST_KEY = "ssf::lastKey";
let fallbackStorage = typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
export function setFallbackStorage(storage) {
    fallbackStorage = storage;
}
let dbPromise = null;
function isIndexedDBAvailable() {
    return typeof indexedDB !== "undefined";
}
function openDatabase() {
    if (!isIndexedDBAvailable()) {
        return Promise.reject(new Error("IndexedDB is not available"));
    }
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(FLIGHTS_STORE)) {
                    db.createObjectStore(FLIGHTS_STORE, { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains(META_STORE)) {
                    db.createObjectStore(META_STORE, { keyPath: "key" });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
        });
    }
    return dbPromise;
}
function runTransaction(db, storeName, mode, operation) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        try {
            operation(store);
        }
        catch (error) {
            reject(error instanceof Error ? error : new Error("IndexedDB transaction error"));
            return;
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
        tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
    });
}
function getFromStore(storeName, key) {
    return openDatabase()
        .then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB get failed"));
    }));
}
function getAllKeys(storeName) {
    return openDatabase()
        .then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const request = store.getAllKeys();
        request.onsuccess = () => {
            const keys = request.result.map((key) => String(key));
            resolve(keys);
        };
        request.onerror = () => reject(request.error ?? new Error("IndexedDB getAllKeys failed"));
    }));
}
function fallbackSaveFlight(id, payload) {
    if (!fallbackStorage)
        return;
    try {
        const snapshot = JSON.stringify(payload);
        fallbackStorage.setItem(`${FALLBACK_PREFIX}${id}`, snapshot);
    }
    catch (error) {
        console.warn("Fallback save failed:", error);
    }
}
function fallbackLoadFlight(id) {
    if (!fallbackStorage)
        return null;
    try {
        const raw = fallbackStorage.getItem(`${FALLBACK_PREFIX}${id}`);
        return raw ? JSON.parse(raw) : null;
    }
    catch (error) {
        console.warn("Fallback load failed:", error);
        return null;
    }
}
function fallbackSetLastKey(key) {
    if (!fallbackStorage)
        return;
    try {
        fallbackStorage.setItem(FALLBACK_LAST_KEY, key);
    }
    catch (error) {
        console.warn("Fallback setLastKey failed:", error);
    }
}
function fallbackGetLastKey() {
    if (!fallbackStorage)
        return null;
    try {
        return fallbackStorage.getItem(FALLBACK_LAST_KEY) ?? null;
    }
    catch (error) {
        console.warn("Fallback getLastKey failed:", error);
        return null;
    }
}
function fallbackListKeys() {
    if (!fallbackStorage)
        return [];
    try {
        const keys = [];
        for (let i = 0; i < fallbackStorage.length; i += 1) {
            const key = fallbackStorage.key(i);
            if (key && key.startsWith(FALLBACK_PREFIX)) {
                keys.push(key.replace(FALLBACK_PREFIX, ""));
            }
        }
        return keys;
    }
    catch (error) {
        console.warn("Fallback listKeys failed:", error);
        return [];
    }
}
function fallbackDeleteFlight(id) {
    if (!fallbackStorage)
        return;
    try {
        fallbackStorage.removeItem(`${FALLBACK_PREFIX}${id}`);
    }
    catch (error) {
        console.warn("Fallback deleteFlight failed:", error);
    }
}
export async function saveFlight(id, payload) {
    const record = { id, payload, updatedAt: Date.now() };
    try {
        const db = await openDatabase();
        await runTransaction(db, FLIGHTS_STORE, "readwrite", (store) => {
            store.put(record);
        });
    }
    catch (error) {
        console.warn("[db] saveFlight falling back:", error);
        fallbackSaveFlight(id, payload);
    }
}
export async function deleteFlight(id) {
    try {
        const db = await openDatabase();
        await runTransaction(db, FLIGHTS_STORE, "readwrite", (store) => {
            store.delete(id);
        });
    }
    catch (error) {
        console.warn("[db] deleteFlight falling back:", error);
        fallbackDeleteFlight(id);
    }
}
export async function loadFlight(id) {
    try {
        const record = await getFromStore(FLIGHTS_STORE, id);
        if (!record) {
            return fallbackLoadFlight(id);
        }
        return record.payload ?? null;
    }
    catch (error) {
        console.warn("[db] loadFlight falling back:", error);
        return fallbackLoadFlight(id);
    }
}
export async function setLastFlightKey(key) {
    const record = { key: LAST_KEY_META, value: key, updatedAt: Date.now() };
    try {
        const db = await openDatabase();
        await runTransaction(db, META_STORE, "readwrite", (store) => {
            store.put(record);
        });
    }
    catch (error) {
        console.warn("[db] setLastFlightKey falling back:", error);
        fallbackSetLastKey(key);
    }
}
export async function getLastFlightKey() {
    try {
        const record = await getFromStore(META_STORE, LAST_KEY_META);
        if (!record) {
            return fallbackGetLastKey();
        }
        return typeof record.value === "string" ? record.value : null;
    }
    catch (error) {
        console.warn("[db] getLastFlightKey falling back:", error);
        return fallbackGetLastKey();
    }
}
export async function listFlightKeys() {
    try {
        const keys = await getAllKeys(FLIGHTS_STORE);
        if (!keys.length) {
            return fallbackListKeys();
        }
        return keys;
    }
    catch (error) {
        console.warn("[db] listFlightKeys falling back:", error);
        return fallbackListKeys();
    }
}
