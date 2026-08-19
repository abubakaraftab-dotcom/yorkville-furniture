import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";

import type { ReactNode } from "react";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  emptyAction?: ReactNode;
}

export default function ProductGrid({
  products,
  emptyMessage = "No products found.",
  emptyAction,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-lg">{emptyMessage}{emptyAction ? " " : ""}{emptyAction}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
