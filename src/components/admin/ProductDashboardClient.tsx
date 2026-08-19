"use client";

import { useEffect, useMemo, useState } from "react";
import productsData from "@/data/products.json";
import categoriesData from "@/data/categories.json";
import colours from "@/data/colours.json";
import deliveryCities from "@/data/delivery-cities.json";
import websiteMediaData from "@/data/website-media.json";
import type { Product } from "@/types/product";
import {
  downloadTextFile,
  importCatalogPackage,
  isAdminSessionActive,
  markCatalogExported,
  mergeCatalogChanges,
  nextDashboardId,
  normalizeImageFile,
  readCatalogState,
  readMediaRecords,
  removeProductRecord,
  saveMediaRecord,
  saveProductRecord,
  setAdminSession,
  SUPPORTED_IMAGE_TYPES,
} from "@/lib/localCatalog";

const PROVINCES = ["Ontario", "Alberta", "British Columbia", "Quebec"];
const CITIES: Record<string, string[]> = {
  Ontario: Object.keys(deliveryCities).sort((a, b) => a.localeCompare(b)),
  Alberta: ["Calgary", "Edmonton", "Red Deer", "Grande Prairie", "Lethbridge"],
  "British Columbia": [
    "Vancouver",
    "Surrey",
    "Burnaby",
    "Kelowna",
    "Victoria",
    "Abbotsford",
  ],
  Quebec: ["Montreal", "Quebec City", "Laval", "Longueuil", "Brossard"],
};
const BED_SIZES = ["Single / Twin", "Double", "Queen", "King"];
const emptyProduct = (id: string): Product =>
  ({
    id,
    slug: "",
    title: "",
    description: "",
    shortDescription: "",
    categorySlug: categoriesData.categories[0]?.slug || "",
    subcategorySlug: "",
    priceByProvince: { ON: 0 },
    currency: "CAD",
    sizes: [],
    colours: [],
    images: [],
    tags: [],
    material: "Wood",
    weight: "",
    assemblyRequired: false,
    deliveryEstimate: "1–3 days",
    featured: false,
    inStock: true,
    stockQuantity: 1,
    createdAt: new Date().toISOString().slice(0, 10),
    provinceAvailability: ["ON"],
  }) as Product;

const labelize = (value: string) =>
  value.replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());
const categoryName = (slug: string) =>
  categoriesData.categories.find((item) => item.slug === slug)?.name ||
  labelize(slug);

export default function ProductDashboardClient() {
  const baseProducts = productsData.products as Product[];
  // Hydration safety: sessionStorage is unavailable during server rendering,
  // so detect the session only after the component mounts on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [authenticated, setAuthenticated] = useState(
    mounted ? isAdminSessionActive() : false,
  );
  useEffect(() => {
    if (mounted) setAuthenticated(isAdminSessionActive());
  }, [mounted]);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [imported, setImported] = useState(false);
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("all");
  const [catalogSubcategory, setCatalogSubcategory] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [mediaSlot, setMediaSlot] = useState("hero");
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [importing, setImporting] = useState(false);
  const [catalogState, setCatalogState] = useState(readCatalogState());
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedProvinces, setExpandedProvinces] = useState<string[]>([
    "Ontario",
  ]);
  const products = useMemo(
    () => mergeCatalogChanges(baseProducts),
    [baseProducts, catalogState, notice],
  );
  const catalogSubcategories =
    catalogCategory === "all"
      ? []
      : categoriesData.categories.find((item) => item.slug === catalogCategory)
          ?.subcategories || [];
  const visibleProducts = products.filter((product) => {
    const matchesQuery =
      !query.trim() ||
      `${product.title} ${product.categorySlug} ${product.subcategorySlug}`
        .toLowerCase()
        .includes(query.toLowerCase());
    return (
      matchesQuery &&
      (catalogCategory === "all" || product.categorySlug === catalogCategory) &&
      (catalogSubcategory === "all" ||
        product.subcategorySlug === catalogSubcategory)
    );
  });
  useEffect(() => {
    const refresh = () => setCatalogState(readCatalogState());
    window.addEventListener("yorkville-catalog-changed", refresh);
    return () =>
      window.removeEventListener("yorkville-catalog-changed", refresh);
  }, []);
  const subcategories =
    categoriesData.categories.find(
      (item) => item.slug === editing?.categorySlug,
    )?.subcategories || [];

  const login = (event: React.FormEvent) => {
    event.preventDefault();
    const configuredPassword = process.env.NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD;
    if (!configuredPassword) {
      setError(
        "Dashboard password is not configured. Add NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD to .env.local and restart the local server.",
      );
      return;
    }
    if (password !== configuredPassword) {
      setError("The dashboard password is incorrect.");
      return;
    }
    setAdminSession(true);
    setAuthenticated(true);
    setError("");
  };
  const update = (field: keyof Product, value: unknown) =>
    setEditing((current) =>
      current ? ({ ...current, [field]: value } as Product) : current,
    );
  const updateDimensions = (field: string, value: string) =>
    setEditing((current) =>
      current
        ? ({
            ...current,
            dashboardDimensions: {
              ...((
                current as Product & {
                  dashboardDimensions?: Record<string, string>;
                }
              ).dashboardDimensions || {}),
              [field]: value,
            },
          } as Product)
        : current,
    );
  const updateProvince = (province: string, field: string, value: unknown) =>
    setEditing((current) => {
      if (!current) return current;
      const existing =
        (current as Product & { availability?: Record<string, unknown> })
          .availability || {};
      return {
        ...current,
        availability: {
          ...existing,
          [province]: {
            ...((existing[province] as Record<string, unknown>) || {}),
            [field]: value,
          },
        },
      } as Product;
    });
  const toggleArray = (
    field: "colours" | "sizes" | "provinceAvailability",
    value: string,
  ) =>
    setEditing((current) => {
      if (!current) return current;
      if (field === "colours") {
        const currentNames = (current.colours || []).map((item) => item.name);
        const nextNames = currentNames.includes(value)
          ? currentNames.filter((item) => item !== value)
          : [...currentNames, value];
        return {
          ...current,
          colours: nextNames.map((name) => {
            const item = (colours as { name: string; hex: string }[]).find(
              (colour) => colour.name === name,
            );
            return { name, hex: item?.hex || "" };
          }),
        };
      }
      if (field === "sizes") {
        const currentLabels = (current.sizes || []).map((item) => item.label);
        const nextLabels = currentLabels.includes(value)
          ? currentLabels.filter((item) => item !== value)
          : [...currentLabels, value];
        return {
          ...current,
          sizes: nextLabels.map((label) => ({
            label,
            dimensions: label,
            priceAdjustment: 0,
          })),
        };
      }
      const provinceByCode: Record<string, string> = {
        ON: "Ontario",
        AB: "Alberta",
        BC: "British Columbia",
        QC: "Quebec",
      };
      const province = provinceByCode[value];
      const list = current.provinceAvailability || [];
      const selected = list.includes(value);
      const existing =
        (
          current as Product & {
            availability?: Record<string, Record<string, unknown>>;
          }
        ).availability || {};
      return {
        ...current,
        provinceAvailability: selected
          ? list.filter((item) => item !== value)
          : [...list, value],
        availability: province
          ? {
              ...existing,
              [province]: selected
                ? {
                    ...((existing[province] as Record<string, unknown>) || {}),
                    cities: [],
                    delivery: false,
                    pickup: false,
                  }
                : {
                    cities: CITIES[province],
                    delivery: true,
                    pickup: true,
                  },
            }
          : existing,
      };
    });
  const toggleProvinceExpand = (province: string) =>
    setExpandedProvinces((current) =>
      current.includes(province)
        ? current.filter((item) => item !== province)
        : [...current, province],
    );
  const handleImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(event.target.files || []).slice(0, 3);
      const normalized = await Promise.all(
        files.map((file) => normalizeImageFile(file)),
      );
      update(
        "images",
        normalized.map((item) => item.dataUrl),
      );
      setNotice(
        "Images normalized to a maximum 1600-pixel longest edge and fitted without cropping.",
      );
    } catch (imageError) {
      setError(
        imageError instanceof Error
          ? imageError.message
          : "Could not process images.",
      );
    }
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !editing?.title.trim() ||
      !editing.description.trim() ||
      !(editing.images || []).length
    ) {
      setError(
        "Please fill in the title, description, and at least one product image.",
      );
      return;
    }
    setSaving(true);
    setSaved(false);
    setError("");
    const slug =
      editing.slug ||
      editing.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    saveProductRecord({
      ...editing,
      slug,
      shortDescription:
        editing.shortDescription || editing.description.slice(0, 140),
      priceByProvince: editing.priceByProvince || { ON: 0 },
      altText:
        (editing as Product & { altText?: string }).altText || editing.title,
    });
    setTimeout(() => {
      setSaved(true);
      setTimeout(() => {
        setEditing(null);
        setSaving(false);
        setSaved(false);
        setCatalogState(readCatalogState());
        setNotice(
          "Product saved locally. Export the overlay package when you are ready to publish it.",
        );
      }, 650);
    }, 450);
  };
  const startAdding = () => {
    if (adding) return;
    setAdding(true);
    setTimeout(() => {
      setEditing(
        emptyProduct(
          String(
            nextDashboardId(
              baseProducts.map((item) => item.id),
              Object.keys(catalogState.records),
            ),
          ),
        ),
      );
      setAdding(false);
    }, 500);
  };
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const payload = JSON.parse(await file.text());
      importCatalogPackage(payload);
      setCatalogState(readCatalogState());
      setImported(true);
      setNotice(
        "Dashboard package imported locally. Review the catalogue before exporting again.",
      );
      setError("");
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "This file is not a valid Yorkville dashboard package.",
      );
    } finally {
      setImporting(false);
      event.target.value = "";
      setTimeout(() => setImported(false), 2500);
    }
  };
  const checkmarkIcon = (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
  const spinnerIcon = (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  );
  const exportPackage = () => {
    const state = readCatalogState();
    const overlay = {
      format: "yorkville-dashboard-catalog",
      version: 1,
      exportedAt: new Date().toISOString(),
      records: state.records,
      deletedIds: state.deletedIds,
    };
    const payload = {
      ...overlay,
      media: readMediaRecords(),
      instructions:
        "Copy this overlay package into the repository and run npm run import-dashboard -- yorkville-dashboard-package.json, then review, commit, and test deploy.",
    };
    setExporting(true);
    setTimeout(() => {
      try {
        downloadTextFile(
          "yorkville-dashboard-package.json",
          JSON.stringify(payload, null, 2),
        );
        markCatalogExported();
        setCatalogState(readCatalogState());
        setExported(true);
        setNotice(
          "Overlay package downloaded. Baseline products remain protected and only dashboard changes will be published.",
        );
      } finally {
        setExporting(false);
      }
    }, 450);
    setTimeout(() => setExported(false), 2500);
  };
  const handleMedia = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const normalized = await normalizeImageFile(file);
      setMediaPreview(normalized.dataUrl);
      saveMediaRecord({
        id: `${mediaSlot}-${Date.now()}`,
        slot: mediaSlot,
        title: mediaTitle || file.name,
        path: `public/images/${mediaSlot === "hero" ? "Hero" : "categories"}/${file.name.toLowerCase().replace(/\s+/g, "-")}`,
        dataUrl: normalized.dataUrl,
        width: normalized.width,
        height: normalized.height,
        updatedAt: new Date().toISOString(),
      });
      setNotice(
        "Media replacement saved locally. Export the dashboard package to include it in the next test deploy.",
      );
    } catch (mediaError) {
      setError(
        mediaError instanceof Error
          ? mediaError.message
          : "Could not process media.",
      );
    }
  };
  const summaryCards = [
    [
      "Pending changes",
      String(catalogState.pendingIds.length),
      "Saved locally since the last export",
    ],
    [
      "Editable dashboard records",
      String(Object.keys(catalogState.records).length),
      "Overlay records stored in this browser",
    ],
    [
      "Last export",
      catalogState.lastExportedAt
        ? new Date(catalogState.lastExportedAt).toLocaleString()
        : "Not exported yet",
      "Export creates a reviewable JSON package",
    ],
  ];
  const recentExportedProducts = catalogState.recentExportedIds
    .map((id) => products.find((product) => String(product.id) === String(id)))
    .filter(Boolean) as Product[];

  if (!authenticated)
    return (
      <main className="min-h-screen bg-[#f5f2ed] px-4 py-20">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b6b3d]">
            Yorkville Furniture Canada
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-[#1e2422]">
            Product dashboard
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Private local workspace for adding and maintaining the storefront
            catalogue. Your password is never sent to the public website.
          </p>
          <form onSubmit={login} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold text-[#1e2422]">
              Dashboard password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#9b6b3d]"
                autoFocus
              />
            </label>
            {error && (
              <p className="text-sm font-semibold text-red-700">{error}</p>
            )}
            <button className="w-full rounded-xl bg-[#1e2422] px-4 py-3 font-semibold text-white">
              Open dashboard
            </button>
          </form>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-[#f5f2ed] px-4 py-8 text-[#1e2422]">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b6b3d]">
              Yorkville Furniture Canada
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold">
              Local catalogue dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Add, edit, hide, and prepare products and storefront media. Images
              are automatically resized, contained, and mapped to their category
              and subcategory.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={startAdding}
              disabled={adding}
              className="flex items-center gap-2 rounded-xl bg-[#1e2422] px-5 py-3 text-sm font-semibold text-white"
            >
              {adding ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                    />
                  </svg>
                  Opening form…
                </>
              ) : (
                "+ Add product"
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                document.getElementById("dashboard-import-package")?.click()
              }
              className="flex items-center gap-2 rounded-xl border border-[#ded7cc] bg-white px-5 py-3 text-sm font-semibold"
              style={
                imported
                  ? { borderColor: "#16a34a", color: "#16a34a" }
                  : undefined
              }
            >
              {importing ? spinnerIcon : imported ? checkmarkIcon : null}
              {importing
                ? "Importing…"
                : imported
                  ? "Imported"
                  : "Import dashboard package"}
            </button>
            <input
              id="dashboard-import-package"
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              type="button"
              disabled={exporting}
              onClick={exportPackage}
              className="flex items-center gap-2 rounded-xl border border-[#1e2422] bg-white px-5 py-3 text-sm font-semibold"
              style={
                exported
                  ? { borderColor: "#16a34a", color: "#16a34a" }
                  : undefined
              }
            >
              {exporting ? spinnerIcon : exported ? checkmarkIcon : null}
              {exporting
                ? "Exporting…"
                : exported
                  ? "Exported"
                  : "Export update package"}
            </button>
          </div>
        </header>
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {summaryCards.map(([title, value, caption]) => (
            <div
              key={title}
              className="rounded-2xl border border-[#ded7cc] bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9b6b3d]">
                {title}
              </p>
              <p className="mt-2 break-words font-serif text-2xl font-semibold">
                {value}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{caption}</p>
            </div>
          ))}
        </section>
        {recentExportedProducts.length > 0 && (
          <section className="mb-6 rounded-2xl border border-[#ded7cc] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9b6b3d]">
                  Recent exported products
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  The last five exported records remain editable in this
                  browser.
                </p>
              </div>
              <span className="rounded-full bg-[#f5f2ed] px-3 py-1 text-xs font-semibold">
                {recentExportedProducts.length} records
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {recentExportedProducts.map((product) => (
                <button
                  key={String(product.id)}
                  onClick={() =>
                    setEditing({
                      ...product,
                      images: product.images || [],
                      colours: product.colours || [],
                      sizes: product.sizes || [],
                    })
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-left text-xs font-semibold hover:border-[#9b6b3d]"
                >
                  <span className="block max-w-[180px] truncate">
                    {product.title}
                  </span>
                  <span className="mt-1 block text-[10px] text-slate-500">
                    Edit ID {product.id}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
        {notice && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {notice}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}
        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-3xl bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-semibold">Catalogue</h2>
              <span className="rounded-full bg-[#f5f2ed] px-3 py-1 text-xs font-semibold">
                {products.length} items
              </span>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#9b6b3d]"
            />
            <div className="mt-4 grid gap-2">
              <select
                value={catalogCategory}
                onChange={(event) => {
                  setCatalogCategory(event.target.value);
                  setCatalogSubcategory("all");
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
              >
                <option value="all">All categories</option>
                {categoriesData.categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              {catalogCategory !== "all" && (
                <select
                  value={catalogSubcategory}
                  onChange={(event) =>
                    setCatalogSubcategory(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                >
                  <option value="all">All subcategories</option>
                  {catalogSubcategories.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f5f2ed] px-3 py-2 text-xs font-semibold text-slate-600">
              <span>{visibleProducts.length} matching products</span>
              <button
                type="button"
                onClick={() => {
                  setCatalogCategory("all");
                  setCatalogSubcategory("all");
                  setQuery("");
                }}
                className="text-[#7c512d]"
              >
                Clear filters
              </button>
            </div>
            <div className="mt-4 max-h-[700px] space-y-3 overflow-auto pr-1">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3"
                >
                  <img
                    src={
                      product.images?.[0] ||
                      "/images/placeholders/furniture-placeholder.jpg"
                    }
                    alt=""
                    className="h-16 w-16 rounded-xl bg-[#f5f2ed] object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {product.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {categoryName(product.categorySlug)} /{" "}
                      {labelize(product.subcategorySlug || "Unassigned")}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEditing({
                        ...product,
                        images: product.images || [],
                        colours: product.colours || [],
                        sizes: product.sizes || [],
                      })
                    }
                    className="rounded-lg border border-[#9b6b3d] px-3 py-2 text-xs font-semibold text-[#7c512d]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      removeProductRecord(product.id);
                      setNotice(
                        "Product hidden locally. Export the package to publish the deletion.",
                      );
                    }}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
          {editing ? (
            <form
              onSubmit={save}
              className="rounded-3xl bg-white p-6 shadow-lg"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b3d]">
                    Product checklist
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    {products.some((item) => item.id === editing.id)
                      ? "Edit product"
                      : "Add product"}
                  </h2>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Product ID: {editing.id} · New IDs are generated above the
                    current catalogue range.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="text-sm font-semibold text-slate-500"
                >
                  Cancel
                </button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2 text-sm font-semibold">
                  Title *
                  <input
                    value={editing.title}
                    onChange={(event) => update("title", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold">
                  Description *
                  <textarea
                    value={editing.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                    rows={5}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold">
                  Image Alt Text
                  <input
                    value={
                      (editing as Product & { altText?: string }).altText || ""
                    }
                    onChange={(event) =>
                      update("altText" as keyof Product, event.target.value)
                    }
                    placeholder="Describe the product image for accessibility"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Short description
                  <input
                    value={editing.shortDescription}
                    onChange={(event) =>
                      update("shortDescription", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Category *
                  <select
                    value={editing.categorySlug}
                    onChange={(event) => {
                      update("categorySlug", event.target.value);
                      update("subcategorySlug", "");
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
                  >
                    {categoriesData.categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Subcategory *
                  <select
                    value={editing.subcategorySlug || ""}
                    onChange={(event) =>
                      update("subcategorySlug", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <fieldset className="mt-6 rounded-2xl border border-slate-200 p-4">
                <legend className="px-2 text-sm font-bold">
                  Images — up to 3 *
                </legend>
                <p className="mb-3 text-xs leading-5 text-slate-500">
                  Accepted:{" "}
                  {SUPPORTED_IMAGE_TYPES.map((type) =>
                    type.replace("image/", "").toUpperCase(),
                  ).join(", ")}
                  . Recommended maximum: 1600 px on the longest edge. Images are
                  contained without cropping.
                </p>
                <input
                  type="file"
                  accept={SUPPORTED_IMAGE_TYPES.join(",")}
                  multiple
                  onChange={handleImages}
                  className="block w-full text-sm"
                />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {(editing.images || []).map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="aspect-square rounded-xl bg-[#f5f2ed] p-2"
                    >
                      <img
                        src={image}
                        alt={`Product preview ${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-6 rounded-2xl border border-slate-200 p-4">
                <legend className="px-2 text-sm font-bold">
                  Dimensions in inches
                </legend>
                <p className="mb-3 text-xs text-slate-500">
                  Enter the values in inches. The storefront will display the
                  converted centimetres.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {["height", "width", "depth"].map((dimension) => (
                    <label
                      key={dimension}
                      className="text-xs font-semibold capitalize"
                    >
                      {dimension}
                      <input
                        value={
                          ((
                            editing as Product & {
                              dashboardDimensions?: Record<string, string>;
                            }
                          ).dashboardDimensions || {})[dimension] || ""
                        }
                        onChange={(event) =>
                          updateDimensions(dimension, event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
                        placeholder="inches"
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <fieldset className="rounded-2xl border border-slate-200 p-4">
                  <legend className="px-2 text-sm font-bold">Colours</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(colours as { name: string; image: string }[]).map(
                      (colour) => {
                        const selected = (editing.colours || []).some(
                          (item) => item.name === colour.name,
                        );
                        return (
                          <label
                            key={colour.name}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                toggleArray("colours", colour.name)
                              }
                            />
                            <span
                              className="h-6 w-6 rounded-full border border-slate-300 bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${colour.image})`,
                              }}
                            />
                            {colour.name}
                          </label>
                        );
                      },
                    )}
                  </div>
                </fieldset>
                <fieldset className="rounded-2xl border border-slate-200 p-4">
                  <legend className="px-2 text-sm font-bold">
                    Stock and sizes
                  </legend>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(editing.inStock)}
                      onChange={(event) =>
                        update("inStock", event.target.checked)
                      }
                    />{" "}
                    In stock
                  </label>
                  <label className="mt-3 block text-sm font-semibold">
                    Stock quantity
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={editing.stockQuantity || 0}
                      onChange={(event) =>
                        update("stockQuantity", Number(event.target.value))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
                    />
                  </label>
                  {["wooden-beds", "mattresses"].includes(
                    editing.categorySlug,
                  ) && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-semibold">
                        Available sizes
                      </p>
                      {BED_SIZES.map((size) => (
                        <label
                          key={size}
                          className="mr-4 inline-flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={(editing.sizes || []).some(
                              (item) => item.label === size,
                            )}
                            onChange={() => toggleArray("sizes", size)}
                          />
                          {size}
                        </label>
                      ))}
                    </div>
                  )}
                </fieldset>
              </div>
              <fieldset className="mt-6 rounded-2xl border border-slate-200 p-4">
                <legend className="px-2 text-sm font-bold">
                  Delivery, pickup, city, and province pricing
                </legend>
                <p className="mb-4 text-xs leading-5 text-slate-500">
                  A product is shown only in provinces and cities selected here.
                  Leave cities empty for province-wide availability.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {PROVINCES.map((province) => {
                    const key =
                      province === "Ontario"
                        ? "ON"
                        : province === "Alberta"
                          ? "AB"
                          : province === "Quebec"
                            ? "QC"
                            : "BC";
                    const availability =
                      ((
                        editing as Product & {
                          availability?: Record<
                            string,
                            Record<string, unknown>
                          >;
                        }
                      ).availability || {})[province] || {};
                    return (
                      <div
                        key={province}
                        className="rounded-xl bg-[#f5f2ed] p-4"
                      >
                        <label className="flex items-center gap-2 text-sm font-semibold">
                          <input
                            type="checkbox"
                            checked={(
                              editing.provinceAvailability || []
                            ).includes(key)}
                            onChange={() =>
                              toggleArray("provinceAvailability", key)
                            }
                          />
                          {province}
                        </label>
                        <label className="mt-3 block text-xs font-semibold">
                          Province price CAD
                          <input
                            type="number"
                            min="0"
                            value={
                              editing.priceByProvince?.[
                                key as keyof typeof editing.priceByProvince
                              ] || ""
                            }
                            onChange={(event) =>
                              update("priceByProvince", {
                                ...editing.priceByProvince,
                                [key]: Number(event.target.value),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
                          />
                        </label>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          {(expandedProvinces.includes(province)
                            ? CITIES[province]
                            : CITIES[province].slice(0, 6)
                          ).map((city) => (
                            <label
                              key={city}
                              className="flex items-center gap-1"
                            >
                              <input
                                type="checkbox"
                                checked={(
                                  (availability.cities as string[]) || []
                                ).includes(city)}
                                onChange={(event) =>
                                  updateProvince(
                                    province,
                                    "cities",
                                    event.target.checked
                                      ? [
                                          ...((availability.cities as string[]) ||
                                            []),
                                          city,
                                        ]
                                      : (
                                          (availability.cities as string[]) ||
                                          []
                                        ).filter((item) => item !== city),
                                  )
                                }
                              />
                              {city}
                            </label>
                          ))}
                        </div>
                        {CITIES[province].length > 6 && (
                          <button
                            type="button"
                            onClick={() => toggleProvinceExpand(province)}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#7c512d]"
                          >
                            {expandedProvinces.includes(province)
                              ? "Hide cities"
                              : `+ ${CITIES[province].length - 6} more cities`}
                            <svg
                              className={`h-3 w-3 transition-transform ${expandedProvinces.includes(province) ? "rotate-180" : ""}`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </button>
                        )}
                        <div className="mt-3 flex gap-4 text-xs">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={availability.delivery !== false}
                              onChange={(event) =>
                                updateProvince(
                                  province,
                                  "delivery",
                                  event.target.checked,
                                )
                              }
                            />
                            Delivery
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={availability.pickup !== false}
                              onChange={(event) =>
                                updateProvince(
                                  province,
                                  "pickup",
                                  event.target.checked,
                                )
                              }
                            />
                            Pickup
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </fieldset>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || saved}
                  className="flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-[#1e2422] px-6 py-3 font-semibold text-white transition-colors disabled:opacity-90"
                  style={saved ? { backgroundColor: "#16a34a" } : undefined}
                >
                  {saving ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                        />
                      </svg>
                      Saving…
                    </>
                  ) : saved ? (
                    <>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      Saved
                    </>
                  ) : (
                    "Save product locally"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b3d]">
                  Website media
                </p>
                <h2 className="mt-1 font-serif text-2xl font-semibold">
                  Replace hero banners and website images
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Every current website image is listed below with a live
                  preview. Click `Change image`, choose a replacement, and it
                  will be included in the next exported package. Product images
                  are managed separately inside each product record.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {(
                    websiteMediaData as {
                      media: {
                        group: string;
                        title: string;
                        slot: string;
                        path: string;
                      }[];
                    }
                  ).media.map((mediaItem) => (
                    <div
                      key={mediaItem.slot}
                      className="rounded-2xl border border-slate-200 bg-[#f5f2ed] p-3"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b6b3d]">
                        {mediaItem.group}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-[#1e2422]">
                        {mediaItem.title}
                      </p>
                      <div className="mt-2 flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-white">
                        <img
                          src={`/${mediaItem.path}`}
                          alt={mediaItem.title}
                          loading="lazy"
                          className="max-h-full max-w-full rounded-xl object-contain"
                        />
                      </div>
                      <p className="mt-2 truncate text-[10px] text-slate-500">
                        {mediaItem.path}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaSlot(mediaItem.slot);
                          setMediaTitle(mediaItem.title);
                          setMediaPreview("");
                          document
                            .getElementById("dashboard-media-upload")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                        }}
                        className="mt-3 w-full rounded-xl border border-[#1e2422] px-3 py-2 text-xs font-semibold hover:bg-[#1e2422] hover:text-white"
                      >
                        Change image
                      </button>
                    </div>
                  ))}
                </div>
                <div
                  id="dashboard-media-upload"
                  className="mt-6 rounded-2xl border border-[#ded7cc] bg-[#f5f2ed] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9b6b3d]">
                    Upload replacement
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <select
                      value={mediaSlot}
                      onChange={(event) => setMediaSlot(event.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                    >
                      {(
                        websiteMediaData as {
                          media: {
                            group: string;
                            title: string;
                            slot: string;
                            path: string;
                          }[];
                        }
                      ).media.map((option) => (
                        <option key={option.slot} value={option.slot}>
                          {option.title}
                        </option>
                      ))}
                    </select>
                    <input
                      value={mediaTitle}
                      onChange={(event) => setMediaTitle(event.target.value)}
                      placeholder="Media title or slot name"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                    />
                    <input
                      type="file"
                      accept={SUPPORTED_IMAGE_TYPES.join(",")}
                      onChange={handleMedia}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                    />
                  </div>
                  {mediaPreview && (
                    <img
                      src={mediaPreview}
                      alt="Replacement preview"
                      className="mt-4 max-h-64 w-full rounded-2xl bg-white object-contain p-3"
                    />
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
        <footer className="mt-10 rounded-3xl border border-[#ded7cc] bg-white px-6 py-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b6b3d]">
            Yorkville Furniture Canada
          </p>
          <p className="mt-2 text-sm font-semibold text-[#1e2422]">
            Website project by{" "}
            <span className="font-bold">Muhammad Abubakar</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Sky Marketing Company Canada &nbsp;·&nbsp; 0348-1835118
            &nbsp;/&nbsp; 1 (647) 872-6713
          </p>
        </footer>
      </div>
    </main>
  );
}
