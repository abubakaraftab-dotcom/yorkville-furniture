"use client";

import { useState, useMemo } from "react";
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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

<<<<<<< Updated upstream
  // Filter products by selected province availability and subcategory
  const filteredProducts = useMemo(() => {
    let result = initialProducts;

    if (selectedProvince) {
      result = result.filter((p) => p.provinceAvailability.includes(selectedProvince.code));
    }

    if (selectedSubcategory) {
      result = result.filter((p) => p.subcategorySlug === selectedSubcategory);
    }

    return result;
  }, [initialProducts, selectedProvince, selectedSubcategory]);
=======
  // Filter products by selected province availability
  const filteredProducts = selectedProvince
    ? initialProducts.filter((p) => p.priceByProvince[selectedProvince.code as keyof typeof p.priceByProvince] !== undefined)
    : initialProducts;
>>>>>>> Stashed changes

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

        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSubcategory === null
                  ? "bg-primary text-white"
                  : "bg-muted-light text-foreground hover:bg-border"
              }`}
            >
              All
            </button>
            {category.subcategories.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => setSelectedSubcategory(sub.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSubcategory === sub.slug
                    ? "bg-primary text-white"
                    : "bg-muted-light text-foreground hover:bg-border"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
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
