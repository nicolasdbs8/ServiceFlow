const DB_NAME = "swiss-serviceflow";
const DB_VERSION = 1;
const FLIGHTS_STORE = "flights";
const META_STORE = "meta";
const LAST_KEY_META = "lastKey";

const FALLBACK_PREFIX = "ssf::flight::";
const FALLBACK_LAST_KEY = "ssf::lastKey";

let fallbackStorage: Storage | null =
  typeof window !== "undefined" && window.localStorage ? window.localStorage : null;

export function setFallbackStorage(storage: Storage | null): void {
  fallbackStorage = storage;
}

type FlightRecord = {
  id: string;
  payload: unknown;
  updatedAt: number;
};

type MetaRecord = {
  key: string;
  value: unknown;
  updatedAt: number;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDatabase(): Promise<IDBDatabase> {
  if (!isIndexedDBAvailable()) {
    return Promise.reject(new Error("IndexedDB is not available"));
  }

  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
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

function runTransaction(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    try {
      operation(store);
    } catch (error) {
      reject(error instanceof Error ? error : new Error("IndexedDB transaction error"));
      return;
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

function getFromStore<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  return openDatabase()
    .then(
      (db) =>
        new Promise<T | undefined>((resolve, reject) => {
          const tx = db.transaction(storeName, "readonly");
          const store = tx.objectStore(storeName);
          const request = store.get(key);
          request.onsuccess = () => resolve(request.result as T | undefined);
          request.onerror = () => reject(request.error ?? new Error("IndexedDB get failed"));
        }),
    );
}

function getAllKeys(storeName: string): Promise<string[]> {
  return openDatabase()
    .then(
      (db) =>
        new Promise<string[]>((resolve, reject) => {
          const tx = db.transaction(storeName, "readonly");
          const store = tx.objectStore(storeName);
          const request = store.getAllKeys();
          request.onsuccess = () => {
            const keys = (request.result as IDBValidKey[]).map((key) => String(key));
            resolve(keys);
          };
          request.onerror = () => reject(request.error ?? new Error("IndexedDB getAllKeys failed"));
        }),
    );
}

function fallbackSaveFlight(id: string, payload: unknown): void {
  if (!fallbackStorage) return;
  try {
    const snapshot = JSON.stringify(payload);
    fallbackStorage.setItem(`${FALLBACK_PREFIX}${id}`, snapshot);
  } catch (error) {
    console.warn("Fallback save failed:", error);
  }
}

function fallbackLoadFlight<T>(id: string): T | null {
  if (!fallbackStorage) return null;
  try {
    const raw = fallbackStorage.getItem(`${FALLBACK_PREFIX}${id}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.warn("Fallback load failed:", error);
    return null;
  }
}

function fallbackSetLastKey(key: string): void {
  if (!fallbackStorage) return;
  try {
    fallbackStorage.setItem(FALLBACK_LAST_KEY, key);
  } catch (error) {
    console.warn("Fallback setLastKey failed:", error);
  }
}

function fallbackGetLastKey(): string | null {
  if (!fallbackStorage) return null;
  try {
    return fallbackStorage.getItem(FALLBACK_LAST_KEY) ?? null;
  } catch (error) {
    console.warn("Fallback getLastKey failed:", error);
    return null;
  }
}

function fallbackListKeys(): string[] {
  if (!fallbackStorage) return [];
  try {
    const keys: string[] = [];
    for (let i = 0; i < fallbackStorage.length; i += 1) {
      const key = fallbackStorage.key(i);
      if (key && key.startsWith(FALLBACK_PREFIX)) {
        keys.push(key.replace(FALLBACK_PREFIX, ""));
      }
    }
    return keys;
  } catch (error) {
    console.warn("Fallback listKeys failed:", error);
    return [];
  }
}

function fallbackDeleteFlight(id: string): void {
  if (!fallbackStorage) return;
  try {
    fallbackStorage.removeItem(`${FALLBACK_PREFIX}${id}`);
  } catch (error) {
    console.warn("Fallback deleteFlight failed:", error);
  }
}

export async function saveFlight(id: string, payload: unknown): Promise<void> {
  const record: FlightRecord = { id, payload, updatedAt: Date.now() };
  try {
    const db = await openDatabase();
    await runTransaction(db, FLIGHTS_STORE, "readwrite", (store) => {
      store.put(record);
    });
  } catch (error) {
    console.warn("[db] saveFlight falling back:", error);
    fallbackSaveFlight(id, payload);
  }
}

export async function deleteFlight(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await runTransaction(db, FLIGHTS_STORE, "readwrite", (store) => {
      store.delete(id);
    });
  } catch (error) {
    console.warn("[db] deleteFlight falling back:", error);
    fallbackDeleteFlight(id);
  }
}

export async function loadFlight<T = unknown>(id: string): Promise<T | null> {
  try {
    const record = await getFromStore<FlightRecord>(FLIGHTS_STORE, id);
    if (!record) {
      return fallbackLoadFlight<T>(id);
    }
    return (record.payload as T) ?? null;
  } catch (error) {
    console.warn("[db] loadFlight falling back:", error);
    return fallbackLoadFlight<T>(id);
  }
}

export async function setLastFlightKey(key: string): Promise<void> {
  const record: MetaRecord = { key: LAST_KEY_META, value: key, updatedAt: Date.now() };
  try {
    const db = await openDatabase();
    await runTransaction(db, META_STORE, "readwrite", (store) => {
      store.put(record);
    });
  } catch (error) {
    console.warn("[db] setLastFlightKey falling back:", error);
    fallbackSetLastKey(key);
  }
}

export async function getLastFlightKey(): Promise<string | null> {
  try {
    const record = await getFromStore<MetaRecord>(META_STORE, LAST_KEY_META);
    if (!record) {
      return fallbackGetLastKey();
    }
    return typeof record.value === "string" ? record.value : null;
  } catch (error) {
    console.warn("[db] getLastFlightKey falling back:", error);
    return fallbackGetLastKey();
  }
}

export async function listFlightKeys(): Promise<string[]> {
  try {
    const keys = await getAllKeys(FLIGHTS_STORE);
    if (!keys.length) {
      return fallbackListKeys();
    }
    return keys;
  } catch (error) {
    console.warn("[db] listFlightKeys falling back:", error);
    return fallbackListKeys();
  }
}
