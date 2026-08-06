"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import ImageGallery from "@/components/ui/ImageGallery";
import PriceDisplay from "@/components/ui/PriceDisplay";
import Badge from "@/components/ui/Badge";
import QuantitySelector from "@/components/ui/QuantitySelector";
import Button from "@/components/ui/Button";
import ProvinceAvailability from "./ProvinceAvailability";
import { useProvince } from "@/context/ProvinceContext";
import { useCart } from "@/context/CartContext";
import siteConfig from "@/data/site-config.json";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { selectedProvince } = useProvince();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColour, setSelectedColour] = useState(product.colours[0]);
  const [quantity, setQuantity] = useState(1);
  const [customRequestOpen, setCustomRequestOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");
  const [addedMessageVisible, setAddedMessageVisible] = useState(false);

  const provinceCode = selectedProvince?.code || "ON";
  const basePrice = product.priceByProvince[provinceCode as keyof typeof product.priceByProvince] || 0;
  const currentPrice = basePrice + selectedSize.priceAdjustment;

  const isAvailableLocally = selectedProvince
    ? product.priceByProvince[selectedProvince.code as keyof typeof product.priceByProvince] !== undefined
    : true;

  // Build temporary WhatsApp message links
  const handleAddToCart = () => {
    addToCart(product, selectedSize.label, selectedColour.name, quantity);
    setAddedMessageVisible(true);
    setTimeout(() => {
      setAddedMessageVisible(false);
    }, 3000);
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hi! I have a question about the "${product.title}" (${selectedSize.label}, ${selectedColour.name}).\n` +
      `Price: $${currentPrice.toFixed(2)} CAD\n` +
      `Product link: ${window.location.href}`
    );
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${text}`, "_blank");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hi! I want a custom version of the "${product.title}".\n` +
      `Size details: ${selectedSize.label}\n` +
      `Colour details: ${selectedColour.name}\n` +
      `My Request: ${customMsg}`
    );
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Visuals */}
      <ImageGallery images={product.images} title={product.title} />

      {/* Details */}
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium uppercase tracking-wider text-accent-dark">
              {product.categorySlug.replace("-", " ")}
            </span>
            {product.tags.includes("bestseller") && <Badge variant="success">Bestseller</Badge>}
            {product.tags.includes("new-arrival") && <Badge>New</Badge>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            {product.title}
          </h1>
        </div>

        <PriceDisplay price={currentPrice} compareAtPrice={product.compareAtPrice} />

        <p className="text-foreground/80 leading-relaxed">{product.description}</p>

        {/* Size Selection */}
        {product.sizes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size.label}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg text-sm transition-all cursor-pointer ${
                    selectedSize.label === size.label
                      ? "border-primary bg-primary/5 text-primary font-semibold"
                      : "border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  <div className="text-left font-medium">{size.label}</div>
                  <div className="text-[10px] text-muted">
                    {size.dimensions}
                    {size.priceAdjustment > 0 && ` (+ $${size.priceAdjustment})`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colour Selection */}
        {product.colours.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Colour</h3>
            <div className="flex flex-wrap gap-3">
              {product.colours.map((colour) => (
                <button
                  key={colour.name}
                  onClick={() => setSelectedColour(colour)}
                  className={`group relative flex items-center gap-1.5 p-1 border rounded-full transition-all cursor-pointer ${
                    selectedColour.name === colour.name
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-border"
                  }`}
                  title={colour.name}
                >
                  <span
                    className="w-8 h-8 rounded-full border border-black/10 inline-block"
                    style={{ backgroundColor: colour.hex }}
                  />
                  {selectedColour.name === colour.name && (
                    <span className="text-xs font-semibold pr-2 text-primary">{colour.name}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Province warning */}
        {!isAvailableLocally && selectedProvince && (
          <div className="p-3 bg-error/5 border border-error/20 text-error rounded-xl text-sm font-medium">
            ⚠️ This item is not available for delivery in your selected province ({selectedProvince.name}). You can still inquire about custom ordering via WhatsApp.
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted mb-1 font-semibold">Qty</span>
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
            </div>

            <div className="flex-1 flex flex-col justify-end">
              <Button
                onClick={handleAddToCart}
                variant={isAvailableLocally ? "primary" : "outline"}
                disabled={!isAvailableLocally}
                className="w-full h-[42px]"
              >
                Add to Cart
              </Button>
            </div>
          </div>

          {addedMessageVisible && (
            <div className="bg-success/10 border border-success/20 text-success text-sm py-2 px-3 rounded-lg font-semibold text-center animate-fade-in">
              ✓ Added to Cart!
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <button
              onClick={handleWhatsAppInquiry}
              className="flex-1 inline-flex items-center justify-center gap-1.5 border border-success hover:bg-success/5 text-success font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
            >
              💬 Ask on WhatsApp
            </button>
            <button
              onClick={() => setCustomRequestOpen(!customRequestOpen)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 border border-accent hover:bg-accent/5 text-accent-dark font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
            >
              🛠️ Custom Layout Request
            </button>
          </div>
        </div>

        {/* Custom Request Form */}
        {customRequestOpen && (
          <form onSubmit={handleCustomSubmit} className="border border-accent/20 rounded-xl p-4 bg-accent/5 flex flex-col gap-3">
            <h3 className="font-serif font-bold text-lg text-accent-dark">Custom Design Request</h3>
            <p className="text-xs text-muted">
              We can build dynamic adjustments, custom sizes, drawers, drawers styles, and materials. Detail your request below.
            </p>
            <textarea
              required
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="border border-border bg-white rounded-lg p-2.5 text-sm w-full h-24 focus:ring-1 focus:ring-accent focus:outline-none"
              placeholder="E.g., I want this built in Walnut, with 3 drawers instead of a drawer, and 200cm length."
            />
            <Button type="submit" variant="secondary" size="sm" className="self-end">
              Send Request via WhatsApp
            </Button>
          </form>
        )}

        {/* Technical specifications */}
        <hr className="border-border" />
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div>
            <span className="text-muted">Material:</span> <span className="font-semibold text-foreground">{product.material}</span>
          </div>
          <div>
            <span className="text-muted">Assembly:</span> <span className="font-semibold text-foreground">{product.assemblyRequired ? "Requires Assembly" : "Pre-assembled"}</span>
          </div>
          <div>
            <span className="text-muted">Weight:</span> <span className="font-semibold text-foreground">{product.weight}</span>
          </div>
          <div>
            <span className="text-muted">Delivery:</span> <span className="font-semibold text-foreground">{product.deliveryEstimate}</span>
          </div>
        </div>

        {/* Location Availability */}
        <ProvinceAvailability priceByProvince={product.priceByProvince} />
      </div>
    </div>
  );
}
