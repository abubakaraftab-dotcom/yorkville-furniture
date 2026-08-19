"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";
import Badge from "@/components/ui/Badge";
import { useProvince } from "@/context/ProvinceContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { selectedProvince } = useProvince();
  const provinceCode = selectedProvince?.code ?? "ON";
  const provinceName = selectedProvince?.name ?? "Ontario";
  // Check province availability and price
  const price = product.priceByProvince[provinceCode as keyof typeof product.priceByProvince];
  const isAvailable = price !== undefined;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 relative"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted-light overflow-hidden">

        <Image
          src={product.images[0] || "/images/placeholders/furniture-placeholder.jpg"}
          alt={product.title}
          fill
          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${!isAvailable ? "grayscale" : ""}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />


        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-error text-white text-xs font-bold px-3 py-1.5 rounded-lg">
              Not Available in {provinceName}
              </span>
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isAvailable && product.compareAtPrice && product.compareAtPrice > price && (
            <Badge variant="error">
              {Math.round(((product.compareAtPrice - price) / product.compareAtPrice) * 100)}% OFF
            </Badge>
          )}
          {product.tags.includes("new-arrival") && <Badge>New</Badge>}
          {product.tags.includes("bestseller") && <Badge variant="success">Bestseller</Badge>}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {product.title}
        </h3>
        <p className="text-sm text-muted mt-1 line-clamp-2">{product.shortDescription}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {isAvailable ? (
              <>
                <span className="text-lg font-bold text-primary">{formatPrice(price)}</span>
                {product.compareAtPrice && product.compareAtPrice > price && (
                  <span className="text-sm text-muted line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-error font-semibold">Delivery unavailable</span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/5 px-2.5 py-2 text-[11px]">
          <span className="font-semibold text-primary">Delivery availability: {provinceName}</span>
          <span className="text-muted">{product.stockQuantity ?? 1} in stock</span>
        </div>
      </div>
    </Link>
  );
}
