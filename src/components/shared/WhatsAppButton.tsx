"use client";

import React from "react";
import siteConfig from "@/data/site-config.json";

export default function WhatsAppButton() {
  const message = encodeURIComponent("Hi, I have a question about my order / delivery.");
  const url = `https://wa.me/14387006095?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-success text-white rounded-full shadow-lg hover:bg-success/90 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
      aria-label="Contact us on WhatsApp"
    >
      {/* WhatsApp SVG Icon */}
      <svg
        className="w-8 h-8 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.59 1.98 14.12 .953 11.49 1.012 6.059 1.012 1.637 5.38 1.633 10.81c-.001 1.701.453 3.361 1.314 4.816L1.97 20.264l6.096-1.597-.133.09-.001.001h-.001h-.001-.001-.003-.002zm12.39-7.904c-.332-.165-1.966-.963-2.272-1.074-.306-.111-.53-.165-.752.164-.223.329-.863 1.074-1.057 1.296-.194.22-.39.245-.722.08-1.542-.716-2.664-1.282-3.708-3.076-.275-.472.275-.438.788-1.454.086-.17.043-.32-.02-.452-.065-.133-.53-1.267-.726-1.74-.19-.462-.4-.397-.549-.404l-.468-.009c-.161 0-.422.06-.643.3-.22.24-.842.82-.842 2.002 0 1.182.868 2.327.989 2.49 1.218 1.64 2.589 2.766 4.316 3.42.348.132.697.228 1.045.29.352.062.673.053.927.015.283-.042.863-.35 1.079-.893.216-.54.216-1.004.152-1.101-.065-.098-.24-.165-.572-.33z" />
      </svg>

      {/* Hover tooltip label */}
      <span className="absolute right-16 scale-0 bg-primary font-sans text-xs font-semibold text-white px-3 py-1.5 rounded-lg group-hover:scale-100 transition-all duration-200 shadow-md whitespace-nowrap">
        Need help? Chat with us live.
      </span>
    </a>
  );
}
