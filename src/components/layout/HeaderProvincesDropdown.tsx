"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Province } from "@/types/province";

interface HeaderProvincesDropdownProps {
  provinces: Province[];
}

export default function HeaderProvincesDropdown({ provinces }: HeaderProvincesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef} onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${isOpen ? "text-primary" : "text-foreground hover:text-primary"}`}>
        Shop by Province
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-1/2 top-full z-50 w-[330px] -translate-x-1/2 pt-4">
          <div className="max-h-[72vh] overflow-y-auto rounded-2xl border border-[#e7e1da] bg-white p-2 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-[#faf9f7] px-3 py-3">
              <span className="text-sm font-semibold">Shop by Province</span>
              <Link href="/provinces" onClick={() => setIsOpen(false)} className="text-xs font-semibold text-primary hover:underline">View Province Page</Link>
            </div>
            <div className="space-y-2 p-2">
              {provinces.map((province) => (
                <div key={province.slug} className="rounded-xl border border-transparent p-2 transition hover:border-[#e7e1da] hover:bg-[#faf9f7]">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/provinces/${province.slug}`} onClick={() => setIsOpen(false)} className="text-sm font-semibold text-foreground hover:text-primary">{province.name}</Link>
                    <Link href={`/provinces/${province.slug}`} onClick={() => setIsOpen(false)} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted hover:text-primary">Province page</Link>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-border/60 pt-2">
                    {province.cities.map((city) => (
                      <Link key={city.slug} href={`/provinces/${province.slug}/${city.slug}`} onClick={() => setIsOpen(false)} className="text-xs text-muted transition hover:text-primary hover:underline">{city.name}</Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/provinces" onClick={() => setIsOpen(false)} className="mt-1 block rounded-xl bg-[#2b2926] px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-primary">View all province & city pages</Link>
          </div>
        </div>
      )}
    </div>
  );
}
