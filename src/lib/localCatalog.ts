"use client";

export const CATALOG_STORAGE_KEY = "yorkville_local_catalog_v2";
export const MEDIA_STORAGE_KEY = "yorkville_local_media_v1";
export const ADMIN_SESSION_KEY = "yorkville_admin_session";
export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

const emptyState = (): LocalCatalogState => ({ records: {}, deletedIds: [], pendingIds: [], recentExportedIds: [], lastExportedAt: null });

export function readCatalogState(): LocalCatalogState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = JSON.parse(window.localStorage.getItem(CATALOG_STORAGE_KEY) || "{}");
    return {
      records: raw.records || {},
      deletedIds: raw.deletedIds || [],
      pendingIds: raw.pendingIds || [],
      recentExportedIds: raw.recentExportedIds || [],
      lastExportedAt: raw.lastExportedAt || null,
    };
  } catch {
    return emptyState();
  }
}

export function readCatalogChanges(): LocalCatalogChanges {
  const state = readCatalogState();
  return { records: state.records, deletedIds: state.deletedIds };
}

export function writeCatalogState(state: LocalCatalogState) {
  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("yorkville-catalog-changed"));
}

export function writeCatalogChanges(changes: LocalCatalogChanges) {
  const current = readCatalogState();
  writeCatalogState({ ...current, ...changes });
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

export function saveProductRecord(product: Record<string, unknown>) {
  const state = readCatalogState();
  const id = String(product.id);
  state.records[id] = { ...product, updatedAt: new Date().toISOString() };
  state.deletedIds = state.deletedIds.filter((deletedId) => deletedId !== id);
  state.pendingIds = Array.from(new Set([...state.pendingIds, id]));
  writeCatalogState(state);
}

export function removeProductRecord(id: string | number) {
  const state = readCatalogState();
  const key = String(id);
  state.deletedIds = Array.from(new Set([...state.deletedIds, key]));
  delete state.records[key];
  state.pendingIds = Array.from(new Set([...state.pendingIds, key]));
  writeCatalogState(state);
}

export function restoreProductRecord(id: string | number) {
  const state = readCatalogState();
  const key = String(id);
  state.deletedIds = state.deletedIds.filter((deletedId) => deletedId !== key);
  state.pendingIds = Array.from(new Set([...state.pendingIds, key]));
  writeCatalogState(state);
}

export function markCatalogExported() {
  const state = readCatalogState();
  const exportedIds = [...state.pendingIds].reverse();
  state.recentExportedIds = Array.from(new Set([...exportedIds, ...state.recentExportedIds])).slice(0, 5);
  state.pendingIds = [];
  state.lastExportedAt = new Date().toISOString();
  writeCatalogState(state);
}

export function readMediaRecords(): LocalMediaRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(MEDIA_STORAGE_KEY) || "[]"); } catch { return []; }
}

export function saveMediaRecord(record: LocalMediaRecord) {
  const records = readMediaRecords().filter((item) => item.id !== record.id);
  records.push(record);
  window.localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event("yorkville-media-changed"));
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
