import { formatPrice } from "@/lib/formatters";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  className?: string;
}

export default function PriceDisplay({ price, compareAtPrice, className = "" }: PriceDisplayProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xl font-bold text-foreground">{formatPrice(price)}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-sm text-muted line-through">{formatPrice(compareAtPrice)}</span>
      )}
    </div>
  );
}
