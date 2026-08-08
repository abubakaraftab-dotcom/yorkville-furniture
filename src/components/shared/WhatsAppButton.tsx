"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import siteConfig from "@/data/site-config.json";

export default function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the button in this session
    const isDismissed = sessionStorage.getItem("wa_button_dismissed");
    if (!isDismissed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    sessionStorage.setItem("wa_button_dismissed", "true");
  };

  const message = encodeURIComponent("Hi, I have a question about my order / delivery.");
  const url = `https://wa.me/14387006095?text=${message}`;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-14 h-14 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Contact us on WhatsApp"
      >
        <Image
          src="/images/whatsapp-logo.svg"
          alt="WhatsApp"
          fill
          className="object-contain"
        />

        {/* Hover tooltip label */}
        <span className="absolute top-1/2 -translate-y-1/2 right-16 scale-0 bg-primary font-sans text-xs font-semibold text-white px-3 py-1.5 rounded-lg group-hover:scale-100 transition-all duration-200 shadow-md whitespace-nowrap pointer-events-none">
          Need help? Chat with us live.
        </span>
      </a>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute -top-2 -right-2 w-6 h-6 bg-white text-gray-500 hover:text-gray-800 rounded-full shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors z-10"
        aria-label="Dismiss WhatsApp button"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
