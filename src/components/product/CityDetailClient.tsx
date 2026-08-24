"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useProvince } from "@/context/ProvinceContext";
import type { Province, City } from "@/types/province";
import type { Product } from "@/types/product";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Link from "next/link";
import { getCategoriesByProvince } from "@/lib/categories";

const PRIORITY_CITIES = [
  "Toronto",
  "Ottawa",
  "Brampton",
  "Mississauga",
  "Hamilton",
  "London",
  "Markham",
  "Vaughan",
  "Kitchener",
  "Windsor",
];

interface CityDetailClientProps {
  province: Province;
  city: City;
  products: Product[];
}

export default function CityDetailClient({ province, city, products }: CityDetailClientProps) {
  const { selectedProvince, selectedCity, changeProvince, selectCity, clearCity, isLoading } = useProvince();

  const [citiesOpen, setCitiesOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync global location with this city page: province first, then city.
  useEffect(() => {
    if (isLoading) return;
    if (selectedProvince?.code !== province.code) {
      changeProvince(province.code);
    }
    if (selectedCity !== city.name) {
      selectCity(city.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, province.code, city.name]);

  useEffect(() => () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => {
      const haystack = [product.title, product.description ?? "", ...(product.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [products, searchTerm]);

  const priorityCities = province.cities.filter((c) => PRIORITY_CITIES.includes(c.name));
  const otherCities = province.cities.filter((c) => !PRIORITY_CITIES.includes(c.name));
  const availableCategories = getCategoriesByProvince(province.code);

  const startCategoryHover = (slug: string) => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHoveredCategory(slug), 400);
  };
  const cancelCategoryHover = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    leaveTimerRef.current = setTimeout(() => setHoveredCategory(null), 300);
  };

  return (
    <div className="bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs
          items={[
            { label: "Shop by province", href: "/provinces" },
            { label: province.name, href: `/provinces/${province.slug}` },
            { label: city.name },
          ]}
        />

        {/* Region banner — pale blue-grey, per spec */}
        <div className="bg-[#E9F0F2] border border-[#DCE6EA] rounded-2xl px-6 py-6 sm:px-8 sm:py-8 mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70">
            📍 Furniture available in
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground mt-1">
            {city.name}, {province.name}
          </h1>
          <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
            Everything below is stocked and delivered to {city.name}, {province.name}.
            Your location is set to this city — prices and availability reflect it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left sidebar */}
          <aside className="lg:col-span-1 space-y-5">
            {/* Shop by cities panel */}
            <div className="bg-[#F0F5F6] border border-[#E3ECF0] rounded-xl p-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary mb-3">
                Shop by cities
              </h2>
              <ul className="space-y-0.5">
                {priorityCities.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/provinces/${province.slug}/${c.slug}`}
                      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-[13px] transition-colors ${
                        c.slug === city.slug
                          ? "font-semibold text-primary bg-white"
                          : "text-foreground/80 hover:bg-white/70 hover:text-primary"
                      }`}
                    >
                      🏡 {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              {otherCities.length > 0 && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setCitiesOpen((open) => !open)}
                    className="flex items-center gap-1 py-1.5 px-2 text-[13px] font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
                    aria-expanded={citiesOpen}
                  >
                    {citiesOpen ? "Show fewer cities" : `Show ${otherCities.length} more cities`}
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className={`h-3.5 w-3.5 transition-transform ${citiesOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {citiesOpen && (
                    <ul className="mt-1 max-h-64 overflow-y-auto rounded-lg bg-white/60 divide-y divide-border/60">
                      {otherCities.map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={`/provinces/${province.slug}/${c.slug}`}
                            className={`flex items-center gap-2 py-1.5 px-2 text-[13px] transition-colors ${
                              c.slug === city.slug
                                ? "font-semibold text-primary"
                                : "text-foreground/80 hover:text-primary"
                            }`}
                          >
                            🏡 {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Categories panel */}
            <div className="bg-[#F4EFE6] border border-[#E9E2D4] rounded-xl p-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary mb-3">
                Categories
              </h2>
              <nav className="space-y-1">
                {availableCategories.map((category) => (
                  <div key={category.slug} className="relative">
                    <Link
                      href={`/categories/${category.slug}`}
                      onMouseEnter={() => startCategoryHover(category.slug)}
                      onMouseLeave={cancelCategoryHover}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] font-medium text-foreground/80 hover:bg-white/70 hover:text-primary transition-colors"
                    >
                      <span>{category.name}</span>
                      {(category.subcategories?.length ?? 0) > 0 && (
                        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                          <path d="m7 5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </Link>
                    {hoveredCategory === category.slug && category.subcategories && (
                      <div
                        onMouseEnter={() => startCategoryHover(category.slug)}
                        onMouseLeave={cancelCategoryHover}
                        className="absolute left-0 right-0 z-20 mt-0.5 rounded-lg bg-white border border-border shadow-lg overflow-y-auto max-h-56"
                      >
                        <Link
                          href={`/categories/${category.slug}`}
                          className="block px-3 py-1.5 text-[12px] font-semibold text-primary hover:bg-muted-light"
                        >
                          All {category.name}
                        </Link>
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/categories/${category.slug}/${sub.slug}`}
                            className="block px-3 py-1.5 pl-4 text-[12px] text-foreground/80 hover:bg-muted-light hover:text-primary"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {availableCategories.length === 0 && (
                  <p className="text-[13px] text-muted">
                    No categories available locally for {province.name} yet.
                  </p>
                )}
              </nav>
            </div>
          </aside>

          {/* Main catalogue */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-xl font-bold font-serif text-foreground">
                  Available items in {city.name}
                </h2>
                <span className="shrink-0 rounded-full border border-border bg-[#FAFAF9] px-3 py-1.5 text-xs font-semibold text-primary">
                  {filteredProducts.length} pieces available
                </span>
              </div>

              {/* Compact search scoped to the city catalogue */}
              <div className="mt-4 relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
                  aria-hidden="true"
                >
                  <path
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={`Search furniture in ${city.name}…`}
                  className="w-full rounded-lg border border-border bg-[#FAFAF9] py-2 pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  aria-label={`Search furniture in ${city.name}`}
                />
              </div>

              <div className="mt-5">
                <ProductGrid
                  products={filteredProducts}
                  emptyMessage={`No items currently available in ${city.name}.`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
