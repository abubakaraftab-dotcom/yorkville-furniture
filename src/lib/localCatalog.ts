"use client";

// We keep the keys for backward compatibility/session, but catalog and media 
// will move to IndexedDB to avoid QuotaExceededError.
export const CATALOG_STORAGE_KEY = "yorkville_local_catalog_v2";
export const MEDIA_STORAGE_KEY = "yorkville_local_media_v1";
export const ADMIN_SESSION_KEY = "yorkville_admin_session";
export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const DB_NAME = "YorkvilleDashboardDB";
const DB_VERSION = 1;
const STORE_CATALOG = "catalog";
const STORE_MEDIA = "media";

export type LocalCatalogState = {
  records: Record<string, Record<string, unknown>>;
  deletedIds: string[];
  pendingIds: string[];
  recentExportedIds: string[];
  lastExportedAt: string | null;
};

export type LocalCatalogChanges = Pick<LocalCatalogState, "records" | "deletedIds">;

export type LocalMediaRecord = {
  id: string;
  slot: string;
  title: string;
  path: string;
  dataUrl: string;
  width: number;
  height: number;
  updatedAt: string;
};

const emptyState = (): LocalCatalogState => ({ 
  records: {}, 
  deletedIds: [], 
  pendingIds: [], 
  recentExportedIds: [], 
  lastExportedAt: null 
});

// IndexedDB Helper
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_CATALOG)) db.createObjectStore(STORE_CATALOG);
      if (!db.objectStoreNames.contains(STORE_MEDIA)) db.createObjectStore(STORE_MEDIA);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getFromDB<T>(storeName: string, key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function setToDB<T>(storeName: string, key: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Global in-memory cache to support synchronous reads where necessary, 
// though we'll move to async patterns.
let cachedCatalog: LocalCatalogState | null = null;
let cachedMedia: LocalMediaRecord[] | null = null;

export async function initLocalCatalog(): Promise<void> {
  if (typeof window === "undefined") return;
  
  // 1. Try to load from IndexedDB
  const dbState = await getFromDB<LocalCatalogState>(STORE_CATALOG, "current");
  if (dbState) {
    cachedCatalog = dbState;
  } else {
    // 2. Migration: If DB is empty, check localStorage
    try {
      const raw = JSON.parse(window.localStorage.getItem(CATALOG_STORAGE_KEY) || "null");
      if (raw) {
        cachedCatalog = {
          records: raw.records || {},
          deletedIds: raw.deletedIds || [],
          pendingIds: raw.pendingIds || [],
          recentExportedIds: raw.recentExportedIds || [],
          lastExportedAt: raw.lastExportedAt || null,
        };
        // Save to DB and clear localStorage to prevent future quota issues
        await setToDB(STORE_CATALOG, "current", cachedCatalog);
        window.localStorage.removeItem(CATALOG_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Migration failed", e);
    }
  }

  // Same for Media
  const dbMedia = await getFromDB<LocalMediaRecord[]>(STORE_MEDIA, "current");
  if (dbMedia) {
    cachedMedia = dbMedia;
  } else {
    try {
      const raw = JSON.parse(window.localStorage.getItem(MEDIA_STORAGE_KEY) || "null");
      if (raw) {
        cachedMedia = raw;
        await setToDB(STORE_MEDIA, "current", cachedMedia);
        window.localStorage.removeItem(MEDIA_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Media migration failed", e);
    }
  }
}

export function readCatalogState(): LocalCatalogState {
  return cachedCatalog || emptyState();
}

export function readCatalogChanges(): LocalCatalogChanges {
  const state = readCatalogState();
  return { records: state.records, deletedIds: state.deletedIds };
}

export async function writeCatalogState(state: LocalCatalogState) {
  cachedCatalog = state;
  if (typeof window !== "undefined") {
    await setToDB(STORE_CATALOG, "current", state);
    window.dispatchEvent(new Event("yorkville-catalog-changed"));
  }
}

export async function writeCatalogChanges(changes: LocalCatalogChanges) {
  const current = readCatalogState();
  await writeCatalogState({ ...current, ...changes });
}

export function mergeCatalogChanges<T extends { id: string | number }>(baseProducts: T[]): T[] {
  const state = readCatalogState();
  const deleted = new Set(state.deletedIds.map(String));
  const baseIds = new Set(baseProducts.map((product) => String(product.id)));
  const merged = baseProducts
    .filter((product) => !deleted.has(String(product.id)))
    .map((product) => ({ ...product, ...(state.records[String(product.id)] || {}) } as T));
  Object.entries(state.records).forEach(([id, record]) => {
    if (!baseIds.has(String(id)) && !deleted.has(String(id))) merged.push(record as T);
  });
  return merged;
}

export function nextDashboardId(baseIds: Array<string | number>, localIds: Array<string | number> = []): number {
  const allIds = [...baseIds, ...localIds].map((id) => Number(id)).filter((id) => Number.isFinite(id));
  return Math.max(0, ...allIds) + 1;
}

export async function saveProductRecord(product: Record<string, unknown>) {
  const state = readCatalogState();
  const id = String(product.id);
  state.records[id] = { ...product, updatedAt: new Date().toISOString() };
  state.deletedIds = state.deletedIds.filter((deletedId) => deletedId !== id);
  state.pendingIds = Array.from(new Set([...state.pendingIds, id]));
  await writeCatalogState(state);
}

export async function removeProductRecord(id: string | number) {
  const state = readCatalogState();
  const key = String(id);
  state.deletedIds = Array.from(new Set([...state.deletedIds, key]));
  delete state.records[key];
  state.pendingIds = Array.from(new Set([...state.pendingIds, key]));
  await writeCatalogState(state);
}

export async function restoreProductRecord(id: string | number) {
  const state = readCatalogState();
  const key = String(id);
  state.deletedIds = state.deletedIds.filter((deletedId) => deletedId !== key);
  state.pendingIds = Array.from(new Set([...state.pendingIds, key]));
  await writeCatalogState(state);
}

export async function markCatalogExported() {
  const state = readCatalogState();
  const exportedIds = [...state.pendingIds].reverse();
  state.recentExportedIds = Array.from(new Set([...exportedIds, ...state.recentExportedIds])).slice(0, 5);
  state.pendingIds = [];
  state.lastExportedAt = new Date().toISOString();
  await writeCatalogState(state);
}

export function readMediaRecords(): LocalMediaRecord[] {
  return cachedMedia || [];
}

export async function saveMediaRecord(record: LocalMediaRecord) {
  const records = readMediaRecords().filter((item) => item.id !== record.id);
  records.push(record);
  cachedMedia = records;
  if (typeof window !== "undefined") {
    await setToDB(STORE_MEDIA, "current", records);
    window.dispatchEvent(new Event("yorkville-media-changed"));
  }
}

export function normalizeImageFile(file: File, maxEdge = 1600, quality = 0.88): Promise<{ dataUrl: string; mimeType: string; width: number; height: number; name: string }> {
  return new Promise((resolve, reject) => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) { reject(new Error("Please choose a JPEG, PNG, or WebP image.")); return; }
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) { reject(new Error(`Could not process ${file.name}.`)); return; }
      if (file.type !== "image/png") { context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height); }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve({ dataUrl: canvas.toDataURL(file.type, quality), mimeType: file.type, width: canvas.width, height: canvas.height, name: file.name });
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error(`Could not read ${file.name}.`)); };
    image.src = objectUrl;
  });
}

export async function importCatalogPackage(payload: { records?: Record<string, Record<string, unknown>>; deletedIds?: string[] }) {
  const current = readCatalogState();
  const incomingRecords = payload.records || {};
  const incomingDeleted = payload.deletedIds || [];
  const records = { ...current.records, ...incomingRecords };
  incomingDeleted.forEach((id) => delete records[String(id)]);
  await writeCatalogState({ 
    ...current, 
    records, 
    deletedIds: Array.from(new Set([...current.deletedIds, ...incomingDeleted.map(String)])), 
    pendingIds: Array.from(new Set([...current.pendingIds, ...Object.keys(incomingRecords), ...incomingDeleted.map(String)])) 
  });
}

export function downloadTextFile(filename: string, content: string, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}

export function setAdminSession(active: boolean) {
  if (active) window.sessionStorage.setItem(ADMIN_SESSION_KEY, "active");
  else window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminSessionActive() {
  return typeof window !== "undefined" && window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "active";
}
