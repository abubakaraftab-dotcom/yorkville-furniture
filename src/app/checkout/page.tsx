"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useProvince } from "@/context/ProvinceContext";
import { formatPrice } from "@/lib/formatters";
import { sendOwnerNotification, sendCustomerConfirmation } from "@/lib/email";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import type { OrderFormData, Order } from "@/types/order";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import deliveryCitiesData from "@/data/delivery-cities.json";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, isLoading: isCartLoading } = useCart();
  const { selectedProvince, changeProvince } = useProvince();

  const [formData, setFormData] = useState<OrderFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: selectedProvince?.code || "ON",
    postalCode: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Helper to safely get delivery charge (returns null if city not found)
  const getDeliveryCharge = (city: string): number | null => {
    const deliveryCities = deliveryCitiesData as Record<string, number>;
    // Try exact match first
    if (deliveryCities.hasOwnProperty(city)) {
      return deliveryCities[city];
    }
    // Try case-insensitive match
    const normalizedCity = city.trim().toLowerCase();
    for (const [key, val] of Object.entries(deliveryCities)) {
      if (key.toLowerCase() === normalizedCity) {
        return val;
      }
    }
    return null;
  };

  const deliveryCharge = getDeliveryCharge(formData.city);

  // Sync province dropdown with global selected province on mount
  useEffect(() => {
    if (selectedProvince) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({ ...prev, province: selectedProvince.code }));
    }
  }, [selectedProvince]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If changing province in form, sync with global context so delivery rates and taxes reload dynamically
    if (name === "province") {
      changeProvince(value);
    }
  };

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.province ||
      !formData.postalCode
    ) {
      return "Please fill in all required fields.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    // Canadian Postal Code validation (A1A 1A1 or A1A1A1 format)
    const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    if (!postalRegex.test(formData.postalCode)) {
      return "Please enter a valid Canadian postal code (e.g. M5V 1A1).";
    }

    return null;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = `ORD-${Date.now()}`;

      const taxRate = selectedProvince?.taxRate ?? 0;
      const taxAmount = subtotal * taxRate;
      const delivery = deliveryCharge ?? 0;
      const total = subtotal + taxAmount + delivery;


      const order: Order = {
        orderId,
        customer: formData,
        items: cart,
        subtotal,
        deliveryCharge,
        taxRate,
        taxAmount,
        total,
        orderDate: new Date().toISOString(),
        status: "pending",
        paymentMethod: "COD",
      };

      // 1. Prepare notifications
      const emailSends = [
        sendOwnerNotification(order),
        sendCustomerConfirmation(order),
      ];

      // Send emails concurrently
      await Promise.all(emailSends);

      // 2. Build WhatsApp confirmation url and save in session to open after redirect or open now
      const waUrl = buildWhatsAppOrderUrl(order);

      // Store order details in session storage so we can display it on the confirmation page
      sessionStorage.setItem("last-order", JSON.stringify(order));
      sessionStorage.setItem("whatsapp-order-url", waUrl);

      // 3. Clear shopping cart
      clearCart();

      // 4. Redirect to thank-you confirmation page
      router.push("/order-confirmation");
    } catch (e: unknown) {
      console.error("Checkout order placement failed", e);
      setErrorMsg("An error occurred while placing your order. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted">Loading checkout details...</p>
      </div>
    );
  }

  // Redirect to cart if empty
  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold font-serif mb-4">Your Cart is Empty</h1>
        <p className="text-muted mb-6">You must add items to your cart before checking out.</p>
        <Button href="/products">Browse products</Button>
      </div>
    );
  }

  const total = subtotal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs
        items={[
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <h1 className="text-3xl font-bold font-serif text-foreground mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Checkout Form */}
        <form onSubmit={handleFormSubmit} className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-xl font-bold font-serif text-foreground mb-4">
              Customer Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-foreground">
                  First Name <span className="text-error">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-foreground">
                  Last Name <span className="text-error">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-foreground">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-foreground">
                  Phone Number <span className="text-error">*</span>
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 416-555-0199"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-xl font-bold font-serif text-foreground mb-4">
              Shipping Address
            </h2>

            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Street Address <span className="text-error">*</span>
              </label>
              <input
                required
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Apartment, suite, unit, street number and name"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-foreground">
                  City <span className="text-error">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="city"
                  list="delivery-cities-list"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <datalist id="delivery-cities-list">
                  {Object.keys(deliveryCitiesData).map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-foreground">
                  Province <span className="text-error">*</span>
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                >
                  <option value="ON">Ontario (ON)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-foreground">
                  Postal Code <span className="text-error">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="e.g. M5V 1A1"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Order Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Special notes about delivery, dimensions customization preferences, assembly, etc."
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-24"
              />
            </div>
          </div>
        </form>

        {/* Order review sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-border p-6 rounded-xl bg-white">
            <h2 className="text-xl font-bold font-serif text-foreground mb-6">
              Review Your Order
            </h2>

            {/* List of items */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1 mb-6">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.selectedSize}-${item.selectedColour}`}
                  className="flex gap-3 text-sm pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="relative w-12 h-12 bg-muted-light rounded overflow-hidden shrink-0 border border-border">
                    <img src={item.image || "/images/placeholders/furniture-placeholder.jpg"} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-muted mt-0.5">
                        Size: {item.selectedSize}{item.selectedColour ? ` | Colour: ${item.selectedColour}` : ''} | Qty: {item.quantity}
                      </p>
                      <p className="text-xs text-muted mt-1">Dimensions: {item.selectedDimensions || "Custom / to be confirmed"}{item.customDimensions ? ` | Custom: ${item.customDimensions}` : ""}</p>
                  </div>
                  <span className="font-bold text-foreground text-right shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <hr className="border-border mb-4" />


            {/* Totals */}
            <div className="space-y-3 text-sm text-foreground/80">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                {formData.city === "" ? (
                  <span className="font-medium text-foreground">Enter city to calculate</span>
                ) : deliveryCharge !== null ? (
                  <span className="font-medium text-foreground">{deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}</span>
                ) : (
                  <span className="font-medium text-error">Contact us for quote</span>
                )}
              </div>

              <hr className="border-border" />

              <div className="flex justify-between text-base font-bold text-foreground">
                <span>Total</span>
                <span>
                  {formatPrice(subtotal + (subtotal * (selectedProvince?.taxRate ?? 0)) + (deliveryCharge ?? 0))}
                </span>
              </div>
            </div>

            {/* COD and WhatsApp Notices */}
            <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-3">
              <div className="flex gap-2">
                <span className="text-lg leading-none">💰</span>
                <div>
                  <h4 className="font-bold text-accent-dark text-xs uppercase tracking-wider">
                    Cash on Delivery
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    No credit card needed online. Pay at your door when your items arrive.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-lg leading-none">🟢</span>
                <div>
                  <h4 className="font-bold text-accent-dark text-xs uppercase tracking-wider">
                    WhatsApp Message Confirmation
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    After clicking Place Order, please send the pre-filled WhatsApp message to confirm delivery with our staff.
                  </p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <p className="text-sm font-semibold text-error mt-4 text-center">{errorMsg}</p>
            )}

            <Button
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="w-full justify-center mt-6"
            >
              {isSubmitting ? "Placing Order..." : "Place Order (Cash on Delivery)"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
