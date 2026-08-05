"use client";

import { useProvince } from "@/context/ProvinceContext";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface CategoryProductsClientProps {
  category: Category;
  initialProducts: Product[];
}

export default function CategoryProductsClient({
  category,
  initialProducts,
}: CategoryProductsClientProps) {
  const { selectedProvince } = useProvince();

  // Filter products by selected province availability
  const filteredProducts = selectedProvince
    ? initialProducts.filter((p) => p.provinceAvailability.includes(selectedProvince.code))
    : initialProducts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs
        items={[
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-foreground">
          {category.name}
        </h1>
        <p className="text-muted mt-2 max-w-2xl">
          {category.description}
          {selectedProvince && ` delivering in ${selectedProvince.name}.`}
        </p>
      </div>

      <ProductGrid
        products={filteredProducts}
        emptyMessage={`No products available in this category for ${
          selectedProvince?.name || "your province"
        }. Try changing your delivery location in the header.`}
      />
    </div>
  );
}
