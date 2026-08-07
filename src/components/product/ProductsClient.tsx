"use client";

import { useState, useMemo } from "react";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { useProvince } from "@/context/ProvinceContext";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface ProductsClientProps {
  products: Product[];
  categories: Category[];
}

export default function ProductsClient({ products, categories }: ProductsClientProps) {
  const { selectedProvince } = useProvince();

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Extract unique colours from products
  const uniqueColours = useMemo(() => {
    const coloursMap = new Map<string, { name: string; hex: string }>();
    products.forEach((p) => {
      p.colours.forEach((c) => {
        if (!coloursMap.has(c.name)) {
          coloursMap.set(c.name, c);
        }
      });
    });
    return Array.from(coloursMap.values());
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const provinceCode = selectedProvince?.code || "ON";
    const getPrice = (p: Product) => p.priceByProvince[provinceCode as keyof typeof p.priceByProvince] || 0;

    // 1. Filter local availability
    let result = products;
    if (selectedProvince) {
      result = result.filter((p) =>
        p.priceByProvince[selectedProvince.code as keyof typeof p.priceByProvince] !== undefined
      );
    }

    // 2. Filter Category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.categorySlug) || (p.subcategorySlug && selectedCategories.includes(p.subcategorySlug)));
    }

    // 3. Filter Price
    if (maxPrice !== "") {
      result = result.filter((p) => getPrice(p) <= maxPrice);
    }

    // 4. Filter Colours
    if (selectedColours.length > 0) {
      result = result.filter((p) =>
        p.colours.some((c) => selectedColours.includes(c.name))
      );
    }

    // 5. Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 6. Sort
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortBy === "name-asc") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "newest") {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [products, selectedProvince, selectedCategories, maxPrice, selectedColours, searchQuery, sortBy]);

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleColourToggle = (colourName: string) => {
    setSelectedColours((prev) =>
      prev.includes(colourName) ? prev.filter((c) => c !== colourName) : [...prev, colourName]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setMaxPrice("");
    setSelectedColours([]);
    setSearchQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Products" }]} />

      <div className="flex items-baseline justify-between border-b border-border pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">
            All Products
          </h1>
          <p className="text-sm text-muted mt-1">
            {selectedProvince
              ? `Showing items available for delivery in ${selectedProvince.name}`
              : "Showing all items"}
          </p>
        </div>

        {/* Sort and mobile toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-border rounded-lg px-3 py-1.5 font-medium focus:ring-1 focus:ring-primary focus:border-primary text-sm cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden bg-muted-light border border-border p-2 rounded-lg text-foreground hover:bg-border transition-colors cursor-pointer"
            aria-label="Filter products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096C6.543 3.232 9.245 3 12 3Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border border-border p-5 rounded-xl bg-white static">
          <h2 className="text-lg font-bold text-foreground mb-4">Filters</h2>
          <div className="flex flex-col gap-6">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Search</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {categories
            .filter((c) => !c.isCustom)
            .map((cat) => (
              <div key={cat.slug} className="space-y-1">
                <label className="flex items-center gap-2.5 text-sm text-foreground/80 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => handleCategoryToggle(cat.slug)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="font-medium">{cat.name}</span>
                </label>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {cat.subcategories.map((sub) => (
                      <label key={sub.slug} className="flex items-center gap-2.5 text-sm text-foreground/70 cursor-pointer hover:text-foreground">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(sub.slug)}
                          onChange={() => handleCategoryToggle(sub.slug)}
                          className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>{sub.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Max Price (CAD)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="No Limit"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {maxPrice !== "" && (
            <button
              onClick={() => setMaxPrice("")}
              className="text-xs text-muted hover:text-foreground underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Colour Filter */}
      {uniqueColours.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Colour</h3>
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            {uniqueColours.map((colour) => (
              <button
                key={colour.name}
                onClick={() => handleColourToggle(colour.name)}
                className={`group relative flex items-center gap-1.5 p-1 border rounded-full transition-all cursor-pointer ${
                  selectedColours.includes(colour.name)
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-border"
                }`}
                title={colour.name}
              >
                <span
                  className="w-8 h-8 rounded-full border border-black/10 inline-block"
                  style={{ backgroundColor: colour.hex }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Button */}
      {(selectedCategories.length > 0 ||
        maxPrice !== "" ||
        selectedColours.length > 0 ||
        searchQuery !== "") && (
        <button
          onClick={clearAllFilters}
          className="mt-2 text-sm font-semibold text-primary hover:text-primary-dark underline cursor-pointer self-start"
        >
          Reset All Filters
        </button>
      )}
    </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1">
          <div className="text-sm text-muted mb-4 font-medium">
            Found {filteredAndSortedProducts.length} product(s)
          </div>
          <ProductGrid
            products={filteredAndSortedProducts}
            emptyMessage="No products match your filters. Try clearing some options."
          />
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-foreground">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 text-muted hover:text-foreground cursor-pointer"
                aria-label="Close filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-6">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Search</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {categories
            .filter((c) => !c.isCustom)
            .map((cat) => (
              <div key={cat.slug} className="space-y-1">
                <label className="flex items-center gap-2.5 text-sm text-foreground/80 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => handleCategoryToggle(cat.slug)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="font-medium">{cat.name}</span>
                </label>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {cat.subcategories.map((sub) => (
                      <label key={sub.slug} className="flex items-center gap-2.5 text-sm text-foreground/70 cursor-pointer hover:text-foreground">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(sub.slug)}
                          onChange={() => handleCategoryToggle(sub.slug)}
                          className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>{sub.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Max Price (CAD)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="No Limit"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {maxPrice !== "" && (
            <button
              onClick={() => setMaxPrice("")}
              className="text-xs text-muted hover:text-foreground underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Colour Filter */}
      {uniqueColours.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Colour</h3>
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            {uniqueColours.map((colour) => (
              <button
                key={colour.name}
                onClick={() => handleColourToggle(colour.name)}
                className={`group relative flex items-center gap-1.5 p-1 border rounded-full transition-all cursor-pointer ${
                  selectedColours.includes(colour.name)
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-border"
                }`}
                title={colour.name}
              >
                <span
                  className="w-8 h-8 rounded-full border border-black/10 inline-block"
                  style={{ backgroundColor: colour.hex }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Button */}
      {(selectedCategories.length > 0 ||
        maxPrice !== "" ||
        selectedColours.length > 0 ||
        searchQuery !== "") && (
        <button
          onClick={clearAllFilters}
          className="mt-2 text-sm font-semibold text-primary hover:text-primary-dark underline cursor-pointer self-start"
        >
          Reset All Filters
        </button>
      )}
    </div>
          </div>
        </div>
      )}
    </div>
  );
}
