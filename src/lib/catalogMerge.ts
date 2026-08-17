export type CatalogOverlay = {
  format: "yorkville-dashboard-catalog";
  version: 1;
  exportedAt?: string;
  records: Record<string, Record<string, unknown>>;
  deletedIds: string[];
};

export function mergeCatalogWithOverlay<T extends { id: string | number }>(baseProducts: T[], overlay?: Partial<CatalogOverlay> | null): T[] {
  const deleted = new Set((overlay?.deletedIds || []).map(String));
  const records = overlay?.records || {};
  const baseIds = new Set(baseProducts.map((product) => String(product.id)));
  const merged = baseProducts
    .filter((product) => !deleted.has(String(product.id)))
    .map((product) => ({ ...product, ...(records[String(product.id)] || {}) } as T));

  Object.entries(records).forEach(([id, record]) => {
    if (!baseIds.has(String(id)) && !deleted.has(String(id))) merged.push(record as T);
  });

  return merged;
}

export function emptyCatalogOverlay(): CatalogOverlay {
  return { format: "yorkville-dashboard-catalog", version: 1, records: {}, deletedIds: [] };
}
