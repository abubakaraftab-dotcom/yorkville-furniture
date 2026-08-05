"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@/types/order";
import { formatPrice } from "@/lib/formatters";
import Button from "@/components/ui/Button";

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");

  useEffect(() => {
    const savedOrder = sessionStorage.getItem("last-order");
    const savedWaUrl = sessionStorage.getItem("whatsapp-order-url");

    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error("Failed to recover order confirmation payload", e);
      }
    }

    if (savedWaUrl) {
      setWhatsappUrl(savedWaUrl);
      // Auto open WhatsApp on mount to simplify user action
      const timer = setTimeout(() => {
        window.open(savedWaUrl, "_blank");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold font-serif mb-4">Product checkout status</h1>
        <p className="text-muted mb-8">No recent orders found. Check your shopping cart.</p>
        <Link href="/products" className="text-primary font-bold hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
        Thank You for Your Order!
      </h1>
      <p className="text-lg text-primary font-semibold mt-2">
        Order ID: {order.orderId}
      </p>
      <p className="text-muted mt-4 max-w-lg mx-auto">
        Your order has been recorded. An email confirmation has been sent to <span className="font-semibold text-foreground">{order.customer.email}</span>.
      </p>

      {/* WhatsApp trigger card */}
      {whatsappUrl && (
        <div className="mt-8 border border-success/30 rounded-2xl p-6 bg-success/5 max-w-xl mx-auto text-left space-y-4">
          <div className="flex gap-3">
            <span className="text-2xl leading-none">💬</span>
            <div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                Confirm order via WhatsApp
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                We have prepared a pre-filled WhatsApp message summarizing your delivery details. Send it to our support line instantly to guarantee confirmation and fast-track processing.
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 w-full bg-success hover:bg-success/90 text-white font-semibold px-4 py-3 rounded-lg transition-colors cursor-pointer text-sm shadow-sm"
          >
            Send WhatsApp Confirmation
          </a>
        </div>
      )}

      {/* Invoice details summary */}
      <div className="mt-8 border border-border p-6 rounded-2xl bg-white max-w-xl mx-auto text-left">
        <h3 className="font-bold text-base text-foreground mb-4">Delivery Overview</h3>

        <div className="text-xs text-muted space-y-2">
          <div className="flex">
            <span className="w-24 shrink-0 font-medium text-foreground">Ship To:</span>
            <span>
              {order.customer.firstName} {order.customer.lastName}
            </span>
          </div>
          <div className="flex">
            <span className="w-24 shrink-0 font-medium text-foreground">Phone:</span>
            <span>{order.customer.phone}</span>
          </div>
          <div className="flex">
            <span className="w-24 shrink-0 font-medium text-foreground">Address:</span>
            <span>
              {order.customer.address}, {order.customer.city}, {order.customer.province}{" "}
              {order.customer.postalCode}
            </span>
          </div>
          <div className="flex">
            <span className="w-24 shrink-0 font-medium text-foreground">Estimated Delivery:</span>
            <span className="text-success font-semibold">5-10 business days</span>
          </div>
          <div className="flex">
            <span className="w-24 shrink-0 font-medium text-foreground">Payment Plan:</span>
            <span className="text-primary font-bold">Cash on Delivery (COD)</span>
          </div>
        </div>

        <div className="border-t border-border mt-6 pt-4 space-y-2.5 text-sm">
          {order.items.map((item) => (
            <div key={`${item.productId}-${item.selectedSize}-${item.selectedColour}`} className="flex justify-between items-center text-xs">
              <span className="text-foreground">
                {item.title} ({item.selectedSize}, {item.selectedColour}) <span className="font-bold">x{item.quantity}</span>
              </span>
              <span className="font-semibold text-foreground text-right">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}

          <hr className="border-border my-2" />

          <div className="flex justify-between text-xs text-muted">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>

          <div className="flex justify-between text-xs text-muted">
            <span>Tax (ON / QC / BC / AB rates)</span>
            <span>{formatPrice(order.taxAmount)}</span>
          </div>

          <div className="flex justify-between font-bold text-foreground text-sm pt-1">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button href="/products" variant="outline">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
