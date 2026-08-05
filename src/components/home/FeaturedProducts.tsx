"use client";

import { useProvince } from "@/context/ProvinceContext";
import { getFeaturedProducts } from "@/lib/products";
import ProductGrid from "@/components/product/ProductGrid";
import Link from "next/link";

export default function FeaturedProducts() {
  const { selectedProvince } = useProvince();
  const allFeatured = getFeaturedProducts();

  // Filter products by selected province
  const filteredProducts = selectedProvince
    ? allFeatured.filter((p) => p.provinceAvailability.includes(selectedProvince.code))
    : allFeatured;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
          <p className="text-muted mt-2">
            Our most popular handcrafted pieces
            {selectedProvince && ` delivering in ${selectedProvince.name}`}
          </p>
        </div>

        <ProductGrid
          products={filteredProducts.slice(0, 8)}
          emptyMessage={`No featured products currently available in ${
            selectedProvince?.name || "your province"
          }.`}
        />

        <div className="text-center mt-8">
          <Link
            href="/products"
            className="text-primary font-semibold hover:underline"
          >
            View All Products &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
