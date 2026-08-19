"use client";

import { useState } from "react";
import Image from "next/image";

const withBasePath = (assetPath: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${assetPath}`;

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const displayImages = images.length > 0 ? images : ["/images/placeholders/furniture-placeholder.jpg"];

  return (
    <div className={"flex flex-col gap-3"}>
      {/* Main Image */}
      <div className="relative aspect-[4/3] bg-muted-light rounded-xl overflow-hidden border border-border">
        <Image
          src={withBasePath(displayImages[activeIdx])}
          alt={`${title} - image ${activeIdx + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnail strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative w-20 aspect-[4/3] bg-muted-light rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                activeIdx === i ? "border-primary" : "border-transparent hover:border-muted"
              }`}
            >
              <Image
                src={withBasePath(img)}
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
