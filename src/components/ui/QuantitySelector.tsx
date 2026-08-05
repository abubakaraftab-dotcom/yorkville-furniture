"use client";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (value: number) => void;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onChange,
  max = 10,
}: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const increase = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center border border-border rounded-lg max-w-[120px]">
      <button
        onClick={decrease}
        type="button"
        className="w-10 h-10 flex items-center justify-center font-bold text-muted hover:text-foreground hover:bg-muted-light transition-colors rounded-l-lg cursor-pointer"
        disabled={quantity <= 1}
      >
        &minus;
      </button>
      <span className="w-10 text-center font-semibold text-foreground">{quantity}</span>
      <button
        onClick={increase}
        type="button"
        className="w-10 h-10 flex items-center justify-center font-bold text-muted hover:text-foreground hover:bg-muted-light transition-colors rounded-r-lg cursor-pointer"
        disabled={quantity >= max}
      >
        &#43;
      </button>
    </div>
  );
}
