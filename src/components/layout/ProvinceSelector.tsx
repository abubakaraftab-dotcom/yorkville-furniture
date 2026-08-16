"use client";

import { useState } from "react";
import { useProvince } from "@/context/ProvinceContext";

export default function ProvinceSelector() {
  const { selectedProvince, changeProvince, availableProvinces } = useProvince();
  const [isOpen, setIsOpen] = useState(false);
  const currentProvince = selectedProvince ?? availableProvinces[0];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary transition hover:bg-primary/5"
      >
        <span className="hidden items-center gap-1 text-[10px] font-medium leading-tight text-muted md:flex"><svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true"><path d="M10 17s5-4.4 5-9a5 5 0 1 0-10 0c0 4.6 5 9 5 9Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="8" r="1.7" stroke="currentColor" strokeWidth="1.5"/></svg><span>Select your province:</span></span>
        <span className="whitespace-nowrap">{currentProvince?.name ?? "Ontario"}</span>
        <svg viewBox="0 0 20 20" fill="none" className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-50 w-64 pt-2">
          <div className="rounded-xl border border-border bg-white p-2 shadow-xl" role="menu">
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Delivery availability</p>
            {availableProvinces.map((province) => (
              <button
                key={province.code}
                type="button"
                role="menuitem"
                onClick={() => { changeProvince(province.code); setIsOpen(false); }}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition hover:bg-primary/5 ${currentProvince?.code === province.code ? "font-semibold text-primary" : "text-foreground"}`}
              >
                <span>{province.name}</span>
                
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

