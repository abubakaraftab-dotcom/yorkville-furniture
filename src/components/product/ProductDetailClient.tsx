"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import ImageGallery from "@/components/ui/ImageGallery";
import PriceDisplay from "@/components/ui/PriceDisplay";
import Badge from "@/components/ui/Badge";
import QuantitySelector from "@/components/ui/QuantitySelector";
import Button from "@/components/ui/Button";
import { useProvince } from "@/context/ProvinceContext";
import { useCart } from "@/context/CartContext";
import siteConfig from "@/data/site-config.json";
import { DEFAULT_COLOUR_ID, furnitureColours, getFurnitureColour } from "@/data/furniture-colours";

interface ProductDetailClientProps {
  product: Product;
}

function cmToInches(value: string) {
  const number = Number.parseFloat(value.replace(",", "."));
  if (Number.isNaN(number)) return value.trim();
  return `${(number / 2.54).toFixed(1).replace(/\.0$/, "")}"`;
}

function formatDimensions(dimensions: string) {
  const values = dimensions.match(/[0-9]+(?:[.,][0-9]+)?/g) ?? [];
  if (values.length < 3) return { height: dimensions, width: "—", depth: "—" };
  // Catalog strings use L x W x H, while the storefront presents H/W/D.
  return { height: cmToInches(values[2] ?? ""), width: cmToInches(values[0] ?? ""), depth: cmToInches(values[1] ?? "") };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { selectedProvince } = useProvince();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColourId, setSelectedColourId] = useState(DEFAULT_COLOUR_ID);
  const [quantity, setQuantity] = useState(1);
  const [customRequestOpen, setCustomRequestOpen] = useState(false);
  const [colourPopupOpen, setColourPopupOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");
  const [customDimensions, setCustomDimensions] = useState("");
  const [addedMessageVisible, setAddedMessageVisible] = useState(false);

  const selectedColour = getFurnitureColour(selectedColourId);
  const selectedDimensions = useMemo(() => formatDimensions(selectedSize?.dimensions ?? ""), [selectedSize]);
  const basePrice = product.priceByProvince.ON || 0;
  const currentPrice = basePrice + (selectedSize?.priceAdjustment ?? 0);
  const isAvailableInOntario = product.priceByProvince.ON !== undefined;
  const provinceName = selectedProvince?.code === "ON" || !selectedProvince ? "Ontario" : selectedProvince.name;

  const handleAddToCart = () => {
    addToCart(product, selectedSize?.label ?? "Standard", selectedColour.name, quantity, selectedSize?.dimensions, customDimensions.trim() || undefined);
    setAddedMessageVisible(true);
    setTimeout(() => setAddedMessageVisible(false), 3000);
  };

  const inquiryText = () => `Hi! I have a question about the "${product.title}".\nSize: ${selectedSize?.label}\nColour: ${selectedColour.name}\nDimensions: H ${selectedDimensions.height}, W ${selectedDimensions.width}, D ${selectedDimensions.depth}${customDimensions.trim() ? `\nCustom dimensions: ${customDimensions.trim()}` : ""}\nPrice: $${currentPrice.toFixed(2)} CAD\nProduct link: ${typeof window !== "undefined" ? window.location.href : ""}`;

  const handleWhatsAppInquiry = () => {
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(inquiryText())}`, "_blank");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request = `${inquiryText()}\nCustom layout request: ${customMsg}`;
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(request)}`, "_blank");
  };

  const handleEmailRequest = () => {
    const subject = `Custom layout request — ${product.title}`;
    const body = `${inquiryText()}\n\nCustom layout request: ${customMsg}`;
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <ImageGallery images={product.images} title={product.title} />

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium uppercase tracking-wider text-accent-dark">{product.categorySlug.replace("-", " ")}</span>
            {product.tags.includes("bestseller") && <Badge variant="success">Bestseller</Badge>}
            {product.tags.includes("new-arrival") && <Badge>New</Badge>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">{product.title}</h1>
        </div>

        <PriceDisplay price={currentPrice} compareAtPrice={product.compareAtPrice} />
        <p className="text-foreground/80 leading-relaxed">{product.description.replace(/solid/gi, "premium")}</p>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <strong>{isAvailableInOntario ? "Available for delivery in Ontario" : "Ontario availability on request"}</strong>
          <p className="mt-1">This product is currently available for delivery in Ontario. For items available in your province, <Link href="/provinces" className="font-semibold underline underline-offset-2 hover:text-emerald-700">view our provinces page</Link>.</p>
        </div>

        {product.sizes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button key={size.label} type="button" onClick={() => setSelectedSize(size)} className={`px-4 py-2 border rounded-lg text-sm transition-all cursor-pointer ${selectedSize.label === size.label ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border hover:border-primary/50 text-foreground"}`}>
                  <div className="text-left font-medium">{size.label}</div>
                  <div className="text-[10px] text-muted">H {formatDimensions(size.dimensions).height} × W {formatDimensions(size.dimensions).width} × D {formatDimensions(size.dimensions).depth}{size.priceAdjustment !== 0 && ` (${size.priceAdjustment > 0 ? "+" : "−"} $${Math.abs(size.priceAdjustment)})`}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative" id="color-selector">
          <h3 className="text-sm font-semibold text-foreground mb-2">Colour</h3>
          <button type="button" onClick={() => setColourPopupOpen((open) => !open)} className="flex w-full items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-left shadow-sm transition hover:border-primary">
            <span><strong className="block text-sm">{selectedColour.name}</strong><span className="text-xs text-muted">Choose from {furnitureColours.length} uploaded finish colours</span></span><span className="text-muted">{colourPopupOpen ? "▲" : "▼"}</span>
          </button>
          {colourPopupOpen && (
            <div className="absolute z-40 mt-2 w-full rounded-2xl border border-border bg-white p-4 shadow-2xl">
              <button type="button" onClick={() => { setSelectedColourId(DEFAULT_COLOUR_ID); setColourPopupOpen(false); }} className={`mb-4 flex w-full items-center justify-between rounded-xl border-2 p-3 text-left ${selectedColourId === DEFAULT_COLOUR_ID ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}><span><strong className="block text-sm">Default / As shown in image</strong><span className="text-xs text-muted">Keep the same colour as shown in the image</span></span>{selectedColourId === DEFAULT_COLOUR_ID && <span className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-white">✓</span>}</button>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {furnitureColours.map((colour) => (
                  <button key={colour.id} type="button" title={colour.name} onClick={() => { setSelectedColourId(colour.id); setColourPopupOpen(false); }} className={`group relative flex flex-col items-center gap-1 rounded-lg p-1 transition hover:bg-muted-light ${selectedColourId === colour.id ? "ring-2 ring-primary" : ""}`}>
                    <span className="h-10 w-10 rounded-full border-2 border-white bg-cover bg-center shadow-md ring-1 ring-black/10 transition group-hover:scale-110" style={{ backgroundImage: `url(${colour.image})`, backgroundColor: colour.hex }} />
                    <span className="text-[9px] font-semibold leading-tight text-center">{colour.name}</span>
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-36 -translate-x-1/2 rounded-xl border border-border bg-white p-2 text-xs shadow-xl group-hover:block"><span className="mb-1 block h-20 w-full rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${colour.image})`, backgroundColor: colour.hex }} />{colour.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-4"><div className="flex flex-col"><span className="text-xs text-muted mb-1 font-semibold">Qty</span><QuantitySelector quantity={quantity} onChange={setQuantity} /></div><div className="flex-1 flex flex-col justify-end"><Button onClick={handleAddToCart} variant={isAvailableInOntario ? "primary" : "outline"} disabled={!isAvailableInOntario} className="w-full h-[42px]">Add to Cart</Button></div></div>
          <div className="flex items-center justify-between rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-xs"><span className="font-semibold text-primary">In stock</span><span className="text-foreground/70">Only {product.stockQuantity ?? 1} available</span></div>
          {addedMessageVisible && <div className="bg-success/10 border border-success/20 text-success text-sm py-2 px-3 rounded-lg font-semibold text-center">✓ Added to Cart!</div>}
          <div className="flex flex-col sm:flex-row gap-2 mt-2"><button onClick={handleWhatsAppInquiry} className="flex-1 inline-flex items-center justify-center gap-1.5 border border-success hover:bg-success/5 text-success font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm">💬 Ask on WhatsApp</button><button onClick={() => setCustomRequestOpen(!customRequestOpen)} className="flex-1 inline-flex items-center justify-center gap-1.5 border border-accent hover:bg-accent/5 text-accent-dark font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm">🛠️ Custom Layout Request</button></div>
        </div>

        {customRequestOpen && <form onSubmit={handleCustomSubmit} className="border border-accent/20 rounded-xl p-4 bg-accent/5 flex flex-col gap-3"><h3 className="font-serif font-bold text-lg text-accent-dark">Custom Design Request</h3><p className="text-xs text-muted">Tell us your preferred dimensions, finish, storage, or layout changes.</p><textarea required value={customMsg} onChange={(e) => setCustomMsg(e.target.value)} className="border border-border bg-white rounded-lg p-2.5 text-sm w-full h-24 focus:ring-1 focus:ring-accent focus:outline-none" placeholder="Describe your custom request..." /><div className="flex flex-col sm:flex-row justify-end gap-2"><Button type="submit" variant="secondary" size="sm">Send via WhatsApp</Button><button type="button" onClick={handleEmailRequest} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">Send via Email</button></div></form>}

        <hr className="border-border" />
        <div className="grid grid-cols-2 gap-2 text-sm"><div className="rounded-lg border border-border bg-muted-light/35 p-3"><span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">Material</span><span className="mt-1 block font-semibold text-foreground">Wood</span></div><div className="rounded-lg border border-border bg-muted-light/35 p-3"><span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">Assembly</span><span className="mt-1 block font-semibold text-foreground">Ready to use</span></div><div className="rounded-lg border border-border bg-muted-light/35 p-3"><span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">Delivery</span><span className="mt-1 block font-semibold text-foreground">1–3 days</span></div><div className="rounded-lg border border-border bg-muted-light/35 p-3"><span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">Delivery availability</span><span className="mt-1 block font-semibold text-foreground">Ontario</span></div></div>
      </div>
    </div>
  );
}
