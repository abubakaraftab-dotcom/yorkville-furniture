"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getProductLocation } from "@/lib/products";

interface ProductDetailClientProps {
  product: Product;
}

const withBasePath = (assetPath: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${assetPath}`;

function metricSeed(value: string) {
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
}

function cmToInches(value: string) {
  const number = Number.parseFloat(value.replace(",", "."));
  if (Number.isNaN(number)) return value.trim();
  return `${(number / 2.54).toFixed(1).replace(/\.0$/, "")}"`;
}

function formatDimensions(dimensions: string) {
  const values = dimensions.match(/[0-9]+(?:[.,][0-9]+)?/g) ?? [];
  if (values.length < 3) return { height: dimensions, width: "—", depth: "—", heightCm: "—", widthCm: "—", depthCm: "—" };
  // Catalog strings use L x W x H in centimetres; the storefront presents H/W/D in both units.
  const heightCm = `${values[2]} cm`;
  const widthCm = `${values[0]} cm`;
  const depthCm = `${values[1]} cm`;
  return { height: cmToInches(values[2] ?? ""), width: cmToInches(values[0] ?? ""), depth: cmToInches(values[1] ?? ""), heightCm, widthCm, depthCm };
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
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [remainingStock, setRemainingStock] = useState(product.stockQuantity ?? 1);
  const [viewerCount, setViewerCount] = useState(3 + (metricSeed(product.id) % 21));

  const selectedColour = getFurnitureColour(selectedColourId);
  // Only show the finish colours actually selected for this product in the dashboard.
  const selectedColoursList = Array.isArray(product.colours) && product.colours.length ? product.colours : null;
  const displayColours = selectedColoursList
    ? furnitureColours.filter((fc) =>
        selectedColoursList.some((pc) => String(pc.name || "").toLowerCase() === fc.name.toLowerCase())
      )
    : null;
  const selectedDimensions = useMemo(() => formatDimensions(selectedSize?.dimensions ?? ""), [selectedSize]);
  const provinceCode = selectedProvince?.code ?? "ON";
  const basePrice = product.priceByProvince[provinceCode as keyof typeof product.priceByProvince] ?? product.priceByProvince["ON" as keyof typeof product.priceByProvince] ?? 0;
  const currentPrice = basePrice + (selectedSize?.priceAdjustment ?? 0);
  const productSeed = metricSeed(product.id);
  const soldCount = currentPrice >= 500 ? 1 + (productSeed % 5) : 9 + (productSeed % 9);
  const location = getProductLocation(product, provinceCode);
  const isAvailableInProvince = location.available;
  const provinceName = selectedProvince?.name ?? "Ontario";
  const availabilityCities = Array.isArray(location.cities) ? location.cities : [];
  const availabilityText = availabilityCities.length
    ? `Available for delivery in ${provinceName} — including ${availabilityCities.slice(0, 4).join(", ")}${availabilityCities.length > 4 ? ` and ${availabilityCities.length - 4} more ${availabilityCities.length - 4 === 1 ? "area" : "areas"}` : "."}`
    : `Available for delivery across ${provinceName}.`;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setViewerCount((current) => {
        const next = current + (Math.random() > 0.5 ? 1 : -1);
        return Math.min(23, Math.max(3, next));
      });
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const handleAddToCart = () => {
    if (isAddingToCart || remainingStock <= 0) return;
    const cartQuantity = Math.min(quantity, remainingStock);
    setIsAddingToCart(true);
    addToCart(product, selectedSize?.label ?? "Size", selectedColour.name, cartQuantity, selectedSize?.dimensions, customDimensions.trim() || undefined);
    setRemainingStock((stock) => Math.max(0, stock - cartQuantity));
      window.setTimeout(() => {
        setIsAddingToCart(false);
        setAddedMessageVisible(true);
      }, 650);
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

        {/* Compact location line — concise status instead of the large availability box */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-white px-4 py-3 text-[13px] text-foreground/80">
          {isAvailableInProvince ? (
            <span>📍 Available in {provinceName}{availabilityCities.length > 0 ? ` · ${availabilityCities.slice(0, 3).join(", ")}` : ""}</span>
          ) : (
            <span>📍 Not currently available in {provinceName} — <Link href="/provinces" className="font-semibold text-primary underline underline-offset-2">check other provinces</Link> or <button type="button" onClick={handleWhatsAppInquiry} className="font-semibold text-emerald-700 underline underline-offset-2">chat with us on WhatsApp</button></span>
          )}
        </div>

        {product.sizes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => {
                const dimensions = formatDimensions(size.dimensions);
                return <button key={size.label} type="button" onClick={() => setSelectedSize(size)} className={`px-4 py-3 border rounded-lg text-sm transition-all cursor-pointer ${selectedSize.label === size.label ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border hover:border-primary/50 text-foreground"}`}>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[{ label: "Height", inches: dimensions.height, centimetres: dimensions.heightCm }, { label: "Width", inches: dimensions.width, centimetres: dimensions.widthCm }, { label: "Depth", inches: dimensions.depth, centimetres: dimensions.depthCm }].map((dimension) => <div key={dimension.label} className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wide text-muted">{dimension.label}</span><span className="mt-1 block whitespace-nowrap text-[11px] font-semibold text-foreground">{dimension.inches}</span><span className="mt-0.5 block whitespace-nowrap text-[10px] text-muted">({dimension.centimetres})</span></div>)}
                  </div>
                  {size.priceAdjustment !== 0 && <div className="mt-2 text-center text-[10px] text-muted">{size.priceAdjustment > 0 ? "+" : "−"} ${Math.abs(size.priceAdjustment)}</div>}
                </button>;
              })}
            </div>
          </div>
        )}

        <div className="relative" id="color-selector">
          <h3 className="text-sm font-semibold text-foreground mb-2">Colour</h3>
          <button type="button" onClick={() => setColourPopupOpen((open) => !open)} className="flex w-full items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-left shadow-sm transition hover:border-primary">
            <span className="flex items-center gap-3">{selectedColourId !== DEFAULT_COLOUR_ID && "image" in selectedColour && <img src={withBasePath(selectedColour.image)} alt="" className="h-9 w-9 rounded-full border border-black/10 bg-white object-cover shadow-inner" />}<span><strong className="block text-sm">{selectedColour.name}</strong><span className="text-xs text-muted">{displayColours ? `Choose from ${displayColours.length} available finish${displayColours.length === 1 ? "" : "es"}` : "Choose a finish colour"}</span></span></span><span className="text-muted">{colourPopupOpen ? "▲" : "▼"}</span>
          </button>
          {colourPopupOpen && (
            <div className="absolute z-40 mt-2 w-full rounded-2xl border border-border bg-white p-4 shadow-2xl">
              <button type="button" onClick={() => { setSelectedColourId(DEFAULT_COLOUR_ID); setColourPopupOpen(false); }} className={`mb-4 flex w-full items-center justify-between rounded-xl border-2 p-3 text-left ${selectedColourId === DEFAULT_COLOUR_ID ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}><span><strong className="block text-sm">Default / As shown in image</strong><span className="text-xs text-muted">Keep the same colour as shown in the image</span></span>{selectedColourId === DEFAULT_COLOUR_ID && <span className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-white">✓</span>}</button>
              {(displayColours && displayColours.length > 0) ? (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {displayColours.map((colour) => (
                  <button key={colour.id} type="button" title={colour.name} onClick={() => { setSelectedColourId(colour.id); setColourPopupOpen(false); }} className={`group relative flex flex-col items-center gap-1 rounded-lg p-1 transition hover:bg-muted-light ${selectedColourId === colour.id ? "ring-2 ring-primary" : ""}`}>
                    <img src={withBasePath(colour.image)} alt={colour.name} className="h-10 w-10 rounded-full border-2 border-white bg-white object-cover shadow-md ring-1 ring-black/10 transition group-hover:scale-110" />
                    <span className="text-[9px] font-semibold leading-tight text-center">{colour.name}</span>
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-36 -translate-x-1/2 rounded-xl border border-border bg-white p-2 text-xs shadow-xl group-hover:block"><img src={withBasePath(colour.image)} alt="" className="mb-1 block h-20 w-full rounded-lg bg-white object-cover" />{colour.name}</span>
                  </button>
                ))}
              </div>
              ) : (
              <p className="text-xs text-muted py-2">No specific finish colours are listed for this item — keep the default shown in the image, or message us for custom finish options.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-4"><div className="flex flex-col"><span className="text-xs text-muted mb-1 font-semibold">Qty</span><QuantitySelector quantity={quantity} onChange={(value) => setQuantity(Math.min(value, Math.max(1, remainingStock)))} /></div><div className="flex-1 flex flex-col justify-end"><Button onClick={handleAddToCart} variant={isAvailableInProvince ? "primary" : "outline"} disabled={!isAvailableInProvince || isAddingToCart || remainingStock <= 0} className="w-full h-[42px]">{isAddingToCart ? <span className="inline-flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />Adding to cart…</span> : addedMessageVisible ? <span className="inline-flex items-center justify-center gap-2"><span className="text-lg leading-none">✓</span>Added to cart</span> : "Add to Cart"}</Button></div></div>
          <div className="grid grid-cols-3 gap-2"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center"><span className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">✓</span><span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-800">In stock</span><span className="mt-1 block text-sm font-bold text-emerald-950">{remainingStock}</span><span className="block text-[10px] text-emerald-800">units available</span></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center"><span className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700" aria-hidden="true">↗</span><span className="block text-[10px] font-semibold uppercase tracking-wide text-amber-800">Sold</span><span className="mt-1 block text-sm font-bold text-amber-950">{soldCount}</span><span className="block text-[10px] text-amber-800">this season</span></div><div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center"><span className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700" aria-hidden="true">◉</span><span className="block text-[10px] font-semibold uppercase tracking-wide text-sky-800">Viewing now</span><span className="mt-1 block text-sm font-bold text-sky-950">{viewerCount}</span><span className="block text-[10px] text-sky-800">people</span></div></div>
          {addedMessageVisible && <div className="bg-success/10 border border-success/20 text-success text-sm py-2 px-3 rounded-lg font-semibold text-center">✓ Added to Cart!</div>}
          <div className="flex flex-col sm:flex-row gap-2 mt-2"><button onClick={handleWhatsAppInquiry} className="flex-1 inline-flex items-center justify-center gap-1.5 border border-success hover:bg-success/5 text-success font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm">💬 Ask on WhatsApp</button><button onClick={() => setCustomRequestOpen(!customRequestOpen)} className="flex-1 inline-flex items-center justify-center gap-1.5 border border-accent hover:bg-accent/5 text-accent-dark font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm">🛠️ Custom Layout Request</button></div>
        </div>

        {customRequestOpen && <form onSubmit={handleCustomSubmit} className="border border-accent/20 rounded-xl p-4 bg-accent/5 flex flex-col gap-3"><h3 className="font-serif font-bold text-lg text-accent-dark">Custom Design Request</h3><p className="text-xs text-muted">Tell us your preferred dimensions, finish, storage, or layout changes.</p><textarea required value={customMsg} onChange={(e) => setCustomMsg(e.target.value)} className="border border-border bg-white rounded-lg p-2.5 text-sm w-full h-24 focus:ring-1 focus:ring-accent focus:outline-none" placeholder="Describe your custom request..." /><div className="flex flex-col sm:flex-row justify-end gap-2"><Button type="submit" variant="secondary" size="sm">Send via WhatsApp</Button><button type="button" onClick={handleEmailRequest} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">Send via Email</button></div></form>}

        <hr className="border-border" />
        <div className="grid grid-cols-2 gap-2 text-sm"><div className="rounded-lg border border-border bg-muted-light/35 p-3"><span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7.5 12 4l8 3.5-8 3.5L4 7.5Z"/><path d="M4 12.5 12 16l8-3.5M4 17.5 12 21l8-3.5"/></svg></span><span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">Material</span><span className="mt-1 block font-semibold text-foreground">Wood</span></div><div className="rounded-lg border border-border bg-muted-light/35 p-3"><span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></span><span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">Assembly</span><span className="mt-1 block font-semibold text-foreground">Ready to use</span></div><div className="rounded-lg border border-border bg-muted-light/35 p-3"><span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg></span><span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">Delivery</span><span className="mt-1 block font-semibold text-foreground">1–3 days</span></div><div className="rounded-lg border border-border bg-muted-light/35 p-3"><span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.2"/></svg></span><span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">Delivery availability</span><span className="mt-1 block font-semibold text-foreground">Ontario</span></div></div>
      </div>
    </div>
  );
}
