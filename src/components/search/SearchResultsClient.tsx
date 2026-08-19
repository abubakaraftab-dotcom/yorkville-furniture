"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface IndexProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  categorySlug: string;
  subcategorySlug: string;
  image: string;
  provinces: string[];
}

interface IndexCategory {
  slug: string;
  name: string;
  count?: number;
  subcategories?: { slug: string; name: string }[];
}

interface SearchIndex {
  categories: IndexCategory[];
  products: IndexProduct[];
}

const provinceNames: Record<string, string> = {
  ON: "Ontario",
  QC: "Quebec",
  BC: "British Columbia",
  AB: "Alberta",
};

export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const provinceCode = searchParams.get("province") ?? "";

  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [input, setInput] = useState(query);
  const [categorySlug, setCategorySlug] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/search-index.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("index fetch failed"))))
      .then((data) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    if (!index || query.trim().length < 2) return [] as IndexProduct[];
    const q = query.toLowerCase();
    let list = index.products.filter((p) => {
      const hay = [p.title, p.description, p.categorySlug, p.subcategorySlug, ...p.tags]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    if (provinceCode) {
      list = list.filter((p) => p.provinces.includes(provinceCode));
    }
    if (categorySlug) {
      list = list.filter((p) => p.categorySlug === categorySlug);
    }
    return list;
  }, [index, query, provinceCode, categorySlug]);

  const availableCategories = useMemo(() => {
    if (!index) return [] as IndexCategory[];
    if (results.length === 0 && query.trim().length >= 2) {
      // When there are no results yet shown, base chips on full set anyway — keeps navigation useful.
    }
    const counts = new Map<string, number>();
    const scoped = query.trim().length < 2 ? index.products : results;
    for (const p of scoped) counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1);
    return index.categories
      .filter((c) => counts.has(c.slug))
      .map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 }));
  }, [index, results, query]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    window.location.href = `/search?q=${encodeURIComponent(q)}${provinceCode ? `&province=${provinceCode}` : ""}`;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-serif text-foreground">
        {query ? `Search results for “${query}”` : "Search products"}
        {provinceCode && provinceNames[provinceCode] ? ` — ${provinceNames[provinceCode]}` : ""}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {results.length} {results.length === 1 ? "product" : "products"} found
        {provinceCode ? " available in your province" : ""}
      </p>

      <form onSubmit={onSearch} className="mt-5 flex items-center gap-2 max-w-xl">
        <div className="flex items-center gap-2 flex-1 border border-border bg-white rounded-full px-4 py-2.5 focus-within:border-primary transition-colors">
          <svg className="h-4 w-4 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try: dining table, bed, dresser, wood..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
            aria-label="Search products"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-full bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Search
        </button>
      </form>

      {query.trim().length >= 2 && availableCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategorySlug("")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              !categorySlug ? "border-primary bg-primary text-white" : "border-border bg-white text-foreground hover:border-primary"
            }`}
          >
            All
          </button>
          {availableCategories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategorySlug(c.slug === categorySlug ? "" : c.slug)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                c.slug === categorySlug ? "border-primary bg-primary text-white" : "border-border bg-white text-foreground hover:border-primary"
              }`}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {results.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group rounded-xl border border-border bg-white overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square bg-muted-light overflow-hidden">
              {p.image && (
                <img src={p.image} alt={p.title} className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
              )}
            </div>
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                {p.categorySlug}
                {p.subcategorySlug ? ` › ${p.subcategorySlug}` : ""}
              </p>
              <h2 className="mt-1 font-semibold text-foreground line-clamp-2">{p.title}</h2>
              {p.provinces.length > 0 && (
                <p className="mt-1.5 text-xs text-muted">
                  Available in {p.provinces.map((c) => provinceNames[c] ?? c).join(", ")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {query.trim().length >= 2 && results.length === 0 && (
        <div className="mt-10 rounded-xl border border-border bg-white p-10 text-center">
          <p className="text-lg font-semibold text-foreground">No products found</p>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            We could not find any products matching “{query.trim()}”
            {provinceCode ? ` in ${provinceNames[provinceCode]}` : ""}. Try a different keyword or browse all
            products.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href={`/search?q=${encodeURIComponent(query.trim())}`} className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold hover:border-primary transition-colors">
              Search without province filter
            </Link>
            <Link href="/products" className="rounded-full bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors">
              Browse all products
            </Link>
          </div>
        </div>
      )}

      {query.trim().length < 2 && (
        <p className="mt-10 text-sm text-muted">
          Type at least two characters to search titles, descriptions, and categories.
        </p>
      )}
    </div>
  );
}
