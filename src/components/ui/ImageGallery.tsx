"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  title: string;
  displayImages?: string[];
}

export default function ImageGallery({ images, title, displayImages }: ImageGalleryProps) {
  const imagesToRender = displayImages || images;
  const [activeIdx, setActiveIdx] = useState(0);

  const firstImage = imagesToRender[0];
  useEffect(() => {
    setActiveIdx(0);
  }, [firstImage]);
  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/3] bg-muted-light rounded-xl flex items-center justify-center text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div className="relative aspect-[4/3] bg-muted-light rounded-xl overflow-hidden border border-border">
        <Image
          src={imagesToRender[activeIdx]}
          alt={`${title} - image ${activeIdx + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnail strip */}
      {imagesToRender.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative w-20 aspect-[4/3] bg-muted-light rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                activeIdx === i ? "border-primary" : "border-transparent hover:border-muted"
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
