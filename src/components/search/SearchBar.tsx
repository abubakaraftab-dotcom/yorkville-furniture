"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  price?: number;
}

interface IndexCategories {
  slug: string;
  name: string;
  description?: string;
  image?: string;
  order?: number;
  subcategories?: { slug: string; name: string }[];
}

interface SearchIndex {
  generatedAt: string;
  categories: IndexCategories[];
  products: IndexProduct[];
}

interface SearchBarProps {
  className?: string;
  /** If set, suggestions are limited to products available in this province. */
  provinceCode?: string;
  placeholder?: string;
  /** Show the search box inline (vs icon-triggered). Defaults true for desktop header. */
  inline?: boolean;
}

const MAX_SUGGESTIONS = 6;
const MIN_CHARS = 2;

export default function SearchBar({ className = "", provinceCode, placeholder, inline = true }: SearchBarProps) {
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const suggestions = useMemo(() => {
    if (!index || query.trim().length < MIN_CHARS) return [] as IndexProduct[];
    const q = query.toLowerCase();
    const base = index.products.filter((p) => {
      const hay = [p.title, p.description, p.categorySlug, p.subcategorySlug, ...p.tags]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    const scoped = provinceCode ? base.filter((p) => p.provinces.includes(provinceCode)) : base;
    return scoped.slice(0, MAX_SUGGESTIONS);
  }, [index, query, provinceCode]);

  const submitSearch = () => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}${provinceCode ? `&province=${provinceCode}` : ""}`);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 border border-border bg-white rounded-full px-4 py-2 focus-within:border-primary transition-colors">
        <svg className="h-4 w-4 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (activeIdx >= 0 && suggestions[activeIdx]) {
                router.push(`/products/${suggestions[activeIdx].slug}`);
                setOpen(false);
              } else {
                submitSearch();
              }
            } else if (e.key === "ArrowDown") {
              setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              setActiveIdx((i) => Math.max(i - 1, 0));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder ?? "Search furniture..."}
          className="w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
          aria-label="Search products"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-muted hover:text-foreground transition-colors text-xs shrink-0"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-white shadow-xl divide-y divide-border/50 max-h-80 overflow-y-auto">
          {suggestions.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted-light transition-colors ${
                  i === activeIdx ? "bg-muted-light" : ""
                }`}
                onClick={() => {
                  setOpen(false);
                  router.push(`/products/${p.slug}`);
                }}
              >
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-10 w-10 shrink-0 rounded-lg object-cover bg-muted-light"
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground truncate">{p.title}</span>
                  <span className="block text-xs text-muted truncate">
                    {p.categorySlug}
                    {p.subcategorySlug ? ` › ${p.subcategorySlug}` : ""}
                    {typeof p.price === "number" ? ` — $${Number(p.price).toFixed(0)} CAD` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length >= MIN_CHARS && suggestions.length === 0 && index && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-muted shadow-xl">
          No products match “{query.trim()}”{provinceCode ? " in your province" : ""}.{" "}
          <button type="button" className="underline text-primary font-medium" onClick={submitSearch}>
            Search the full catalogue
          </button>
        </div>
      )}
    </div>
  );
}
