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
  const provinceCode = selectedProvince?.code || "ON";

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
<<<<<<< Updated upstream
        <Image
          src={product.images[0] || "/images/placeholders/furniture-placeholder.jpg"}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
=======
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${!isAvailable ? "grayscale" : ""}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        )}
>>>>>>> Stashed changes

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-error text-white text-xs font-bold px-3 py-1.5 rounded-lg">
              Not Available in {selectedProvince?.name || provinceCode}
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

        {/* Province availability badges */}
        <div className="flex gap-1 mt-2">
          {["ON", "QC", "BC", "AB"].map((code) => {
            const isAvail = product.priceByProvince[code as keyof typeof product.priceByProvince] !== undefined;
            return (
              <span
                key={code}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isAvail
                    ? "bg-success/10 text-success"
                    : "bg-muted-light text-muted opacity-40"
                }`}
              >
                {code}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
