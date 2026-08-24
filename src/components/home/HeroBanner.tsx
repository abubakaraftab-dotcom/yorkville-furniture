"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const withBasePath = (assetPath: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${assetPath}`;

const slides = [
  {
    image: "/images/products/modern-grey-sectional-sofa-main.jpg",
    eyebrow: "The Canadian home collection",
    title: "Furniture with a sense of place.",
    description: "Thoughtfully selected pieces, made for the way Canadian homes live, gather, and grow.",
    primaryLabel: "Shop the collection",
    primaryHref: "/products",
    secondaryLabel: "Build your own",
    secondaryHref: "/custom-build",
  },
  {
    image: "/images/products/oak-dining-table-6-seater-main.jpg",
    eyebrow: "Gather beautifully",
    title: "Make room for your best moments.",
    description: "Warm natural finishes and enduring silhouettes for memorable dinners, conversations, and celebrations.",
    primaryLabel: "Explore dining",
    primaryHref: "/products",
    secondaryLabel: "View all products",
    secondaryHref: "/products",
  },
  {
    image: "/images/products/walnut-queen-bed-frame-main.jpg",
    eyebrow: "Made for everyday luxury",
    title: "A quieter kind of luxury.",
    description: "Premium bedroom essentials that bring calm, character, and comfort to your personal space.",
    primaryLabel: "Shop bedroom",
    primaryHref: "/categories",
    secondaryLabel: "Custom sizes",
    secondaryHref: "/custom-build",
  },
];

const benefits = ["Factory-direct value", "Cash on delivery", "Quality assured"];

export default function HeroBanner() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative isolate min-h-[680px] overflow-hidden bg-[#181614] text-white sm:min-h-[720px] lg:min-h-[calc(100vh-96px)] lg:max-h-[850px]">
      <div className="absolute inset-0 bg-[#181614]" aria-live="polite">
        {slides.map((item, index) => (
          <div
            key={item.image}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
            aria-hidden={index !== activeSlide}
          >
            <Image
              src={withBasePath(item.image)}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,17,15,.9)_0%,rgba(19,17,15,.68)_42%,rgba(19,17,15,.16)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl flex-col justify-between px-5 py-12 sm:min-h-[720px] sm:px-8 sm:py-16 lg:min-h-[calc(100vh-96px)] lg:px-10 lg:py-20">
        <div className="max-w-2xl pt-8 sm:pt-12 lg:pt-16">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-[#f4d2a8]">Yorkville Furniture Canada</p>
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#e7c49b]">
            <span className="h-px w-10 bg-[#e7c49b]" />
            {slide.eyebrow}
          </p>
          <h1 className="max-w-xl font-serif text-5xl font-medium leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            {slide.title}
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-white/80 sm:text-lg">
            {slide.description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={slide.primaryHref} className="inline-flex items-center justify-center rounded-full bg-[#d9aa78] px-7 py-3.5 text-sm font-semibold text-[#211b16] transition hover:bg-[#f0cda7]">
              {slide.primaryLabel}
              <span className="ml-3 text-lg leading-none">→</span>
            </Link>
            <Link href={slide.secondaryHref} className="inline-flex items-center justify-center rounded-full border border-white/50 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">
              {slide.secondaryLabel}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-8 border-t border-white/20 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium uppercase tracking-[0.16em] text-white/70">
            {benefits.map((benefit) => <span key={benefit}>{benefit}</span>)}
          </div>
          <div className="flex items-center gap-4" aria-label="Hero slideshow controls">
            <span className="text-sm font-medium text-white/70">0{activeSlide + 1} <span className="mx-1 text-white/40">/</span> 0{slides.length}</span>
            <div className="flex gap-2">
              {slides.map((item, index) => (
                <button
                  key={item.image}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={index === activeSlide}
                  className={`h-1 rounded-full transition-all ${index === activeSlide ? "w-12 bg-[#e7c49b]" : "w-5 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
