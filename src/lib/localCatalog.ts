"use client";

export const CATALOG_STORAGE_KEY = "yorkville_local_catalog_v1";
export const MEDIA_STORAGE_KEY = "yorkville_local_media_v1";
export const ADMIN_SESSION_KEY = "yorkville_admin_session";
export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type LocalCatalogChanges = {
  records: Record<string, Record<string, unknown>>;
  deletedIds: string[];
};

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

export function readCatalogChanges(): LocalCatalogChanges {
  if (typeof window === "undefined") return { records: {}, deletedIds: [] };
  try {
    const value = JSON.parse(window.localStorage.getItem(CATALOG_STORAGE_KEY) || "{}");
    return { records: value.records || {}, deletedIds: value.deletedIds || [] };
  } catch {
    return { records: {}, deletedIds: [] };
  }
}

export function writeCatalogChanges(changes: LocalCatalogChanges) {
  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(changes));
  window.dispatchEvent(new Event("yorkville-catalog-changed"));
}

export function mergeCatalogChanges<T extends { id: string }>(baseProducts: T[]): T[] {
  const changes = readCatalogChanges();
  const deleted = new Set(changes.deletedIds.map(String));
  const baseIds = new Set(baseProducts.map((product) => String(product.id)));
  const merged = baseProducts
    .filter((product) => !deleted.has(String(product.id)))
    .map((product) => ({ ...product, ...(changes.records[String(product.id)] || {}) } as T));
  Object.entries(changes.records).forEach(([id, record]) => {
    if (!baseIds.has(String(id)) && !deleted.has(String(id))) merged.push(record as T);
  });
  return merged;
}

export function saveProductRecord(product: Record<string, unknown>) {
  const changes = readCatalogChanges();
  const id = String(product.id);
  changes.records[id] = { ...product, updatedAt: new Date().toISOString() };
  changes.deletedIds = changes.deletedIds.filter((deletedId) => deletedId !== id);
  writeCatalogChanges(changes);
}

export function removeProductRecord(id: string) {
  const changes = readCatalogChanges();
  changes.deletedIds = Array.from(new Set([...changes.deletedIds, String(id)]));
  delete changes.records[String(id)];
  writeCatalogChanges(changes);
}

export function restoreProductRecord(id: string) {
  const changes = readCatalogChanges();
  changes.deletedIds = changes.deletedIds.filter((deletedId) => deletedId !== String(id));
  writeCatalogChanges(changes);
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
