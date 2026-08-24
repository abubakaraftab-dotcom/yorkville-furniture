"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProvince } from "@/context/ProvinceContext";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface CategoryProductsClientProps {
  category: Category;
  initialProducts: Product[];
}

function CategoryProductsContent({
  category,
  initialProducts,
}: CategoryProductsClientProps) {
  const { selectedProvince } = useProvince();
  const searchParams = useSearchParams();
  const router = useRouter();
  const subParam = searchParams.get("sub");

  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(subParam);

  useEffect(() => {
    if (subParam !== selectedSubcategory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSubcategory(subParam);
    }
  }, [subParam, selectedSubcategory]);

  const handleSubcategoryClick = (slug: string | null) => {
    setSelectedSubcategory(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("sub", slug);
    } else {
      params.delete("sub");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Filter products by selected province availability and subcategory
  const filteredProducts = useMemo(() => {
    let result = initialProducts;

    if (selectedProvince) {
      result = result.filter((p) => p.priceByProvince[selectedProvince.code as keyof typeof p.priceByProvince] !== undefined);
    }

    if (selectedSubcategory) {
      result = result.filter((p) => p.subcategorySlug === selectedSubcategory);
    }

    return result;
  }, [initialProducts, selectedProvince, selectedSubcategory]);


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
              onClick={() => handleSubcategoryClick(null)}
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
                onClick={() => handleSubcategoryClick(sub.slug)}
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
        emptyMessage={`No items are currently available locally in ${
          selectedSubcategory
            ? `“${category.subcategories?.find((sub) => sub.slug === selectedSubcategory)?.name ?? "this subcategory"}”`
            : `“${category.name}”`
        } for ${selectedProvince?.name || "your province"}. Browse our full catalogue or `}
        emptyAction={
          selectedProvince ? (
            <a href="/provinces" className="font-semibold text-primary underline underline-offset-2">view items available in your province</a>
          ) : (
            <a href="/products" className="font-semibold text-primary underline underline-offset-2">browse all products</a>
          )
        }
      />
    </div>
  );
}

export default function CategoryProductsClient(props: CategoryProductsClientProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryProductsContent {...props} />
    </Suspense>
  );
}
