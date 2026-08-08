"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useProvince } from "@/context/ProvinceContext";
import { formatPrice } from "@/lib/formatters";
import Button from "@/components/ui/Button";
import QuantitySelector from "@/components/ui/QuantitySelector";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, isLoading } = useCart();
  const { selectedProvince } = useProvince();

  const total = subtotal;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted">Loading your cart...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold font-serif mb-4">Your Shopping Cart is Empty</h1>
        <p className="text-muted mb-8">Add components or items to get started with your layout.</p>
        <Button href="/products">Shop All Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Cart" }]} />

      <h1 className="text-3xl font-bold font-serif text-foreground mb-8">
        Your Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.productId}-${item.selectedSize}-${item.selectedColour}`}
              className="flex gap-4 p-4 border border-border bg-white rounded-xl"
            >
              {/* Product Thumbnail */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-muted-light rounded-lg overflow-hidden border border-border">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 96px, 128px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                )}
              </div>

              {/* Product Info & Actions */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                      <Link href={`/products/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <span className="font-bold text-foreground shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted mt-1 font-medium">
                    <span>Size: {item.selectedSize}</span>
                    {item.selectedColour && <span>Colour: {item.selectedColour}</span>}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <QuantitySelector
                    quantity={item.quantity}
                    onChange={(val) =>
                      updateQuantity(item.productId, item.selectedSize, item.selectedColour, val)
                    }
                  />
                  <button
                    onClick={() =>
                      removeFromCart(item.productId, item.selectedSize, item.selectedColour)
                    }
                    className="text-xs text-error hover:text-error/80 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="border border-border p-6 rounded-xl bg-white self-start">
          <h2 className="text-xl font-bold font-serif text-foreground mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 text-sm text-foreground/80">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted">Delivery</span>
              <span className="font-medium text-foreground">
                Calculated at checkout
              </span>
            </div>

            <hr className="border-border" />

            <div className="flex justify-between text-base font-bold text-foreground">
              <span>Estimated Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button href="/checkout" className="w-full justify-center">
              Proceed to Checkout
            </Button>
            <Link
              href="/products"
              className="block text-center text-sm font-semibold text-primary hover:text-primary-dark underline"
            >
              Continue Shopping
            </Link>
          </div>

          <div className="p-4 bg-muted-light/60 rounded-xl mt-6 text-xs text-muted space-y-1.5 border border-border">
            <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
              Cash on Delivery (COD)
            </p>
            <p>
              Under our COD system, you do not need to pay anything online. You pay in cash or debit/credit at your door when your furniture arrives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
