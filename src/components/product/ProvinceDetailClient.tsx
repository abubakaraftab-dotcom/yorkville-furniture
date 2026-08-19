"use client";

import { useProvince } from "@/context/ProvinceContext";
import type { Province } from "@/types/province";
import type { Product } from "@/types/product";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SearchBar from "@/components/search/SearchBar";
import Link from 'next/link';

interface ProvinceDetailClientProps {
  province: Province;
  products: Product[];
}

export default function ProvinceDetailClient({ province, products }: ProvinceDetailClientProps) {
  const { selectedProvince, changeProvince } = useProvince();

  const handleSetGlobalProvince = () => {
    changeProvince(province.code);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs
        items={[
          { label: "Provinces", href: "/provinces" },
          { label: province.name },
        ]}
      />

      {/* Hero card */}
      <div className="bg-primary text-white rounded-2xl p-8 sm:p-12 mb-12 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="text-accent font-bold tracking-wider text-xs uppercase">
            Locally Delivered
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif mt-2">
            Premium Furniture in {province.name}
          </h1>
          <p className="text-white/80 mt-4 leading-relaxed">
            {province.deliveryNote}. We provide cash-on-delivery across all servicing cities.
          </p>

          {/* Quick toggle check */}
          {selectedProvince?.code !== province.code ? (
            <button
              onClick={handleSetGlobalProvince}
              className="mt-6 inline-flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
            >
              🤝 Set {province.name} as my Delivery Location
            </button>
          ) : (
            <div className="mt-6 inline-flex items-center gap-1.5 bg-white/10 text-white border border-white/20 font-semibold px-4 py-2.5 rounded-lg text-sm">
              ✓ Shipping location confirmed
            </div>
          )}
        </div>
        {/* Background icon */}
        <div className="absolute right-10 bottom-0 text-[180px] opacity-10 leading-none hidden lg:block select-none">
          {province.code === "ON" && "🏙️"}
          {province.code === "QC" && "⚜️"}
          {province.code === "BC" && "🌲"}
          {province.code === "AB" && "🏔️"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Cities Sidebar */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-xl p-5 bg-white sticky top-20">
            <h2 className="text-lg font-bold text-foreground mb-4">Serviced Cities</h2>
            <ul className="space-y-1.5 text-sm">
              {province.cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/provinces/${province.slug}/${city.slug}`}
                    className="block py-2 px-3 rounded-lg text-foreground/80 hover:bg-muted-light hover:text-primary transition-colors font-medium"
                  >
                    🏡 Furniture availability in {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Available Products grid */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Delivery collection</p>
              <h2 className="text-2xl font-bold font-serif text-foreground">
                Available Furniture in {province.name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Explore the pieces currently available in {province.name}. Availability and delivery options are curated for this province.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-primary">
              {products.length} pieces available
            </span>
            <div className="w-full max-w-sm sm:w-64">
              <SearchBar
                placeholder={`Search in ${province.name}...`}
                provinceCode={province.code}
              />
            </div>
          </div>
          <ProductGrid
            products={products}
            emptyMessage={`We currently have no items available locally for ${province.name}.`}
          />
        </div>
      </div>
    </div>
  );
}
