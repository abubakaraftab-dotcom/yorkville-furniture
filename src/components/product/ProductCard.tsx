import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";
import Badge from "@/components/ui/Badge";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted-light overflow-hidden">
        <Image
          src={product.images[0] || "/images/placeholders/furniture-placeholder.jpg"}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Tags */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <Badge variant="error">
              {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
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
            <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Province availability */}
        <div className="flex gap-1 mt-2">
          {["ON", "QC", "BC", "AB"].map((code) => (
            <span
              key={code}
              className={`text-xs px-1.5 py-0.5 rounded ${
                product.provinceAvailability.includes(code)
                  ? "bg-success/10 text-success"
                  : "bg-muted-light text-muted"
              }`}
            >
              {code}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
