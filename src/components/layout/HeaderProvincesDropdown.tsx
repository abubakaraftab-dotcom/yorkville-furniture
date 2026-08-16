"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Province } from "@/types/province";
import { useRouter } from "next/navigation";

interface HeaderProvincesDropdownProps {
  provinces: Province[];
}

export default function HeaderProvincesDropdown({ provinces }: HeaderProvincesDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${
          isOpen ? "text-primary" : "text-foreground hover:text-primary"
        }`}
      >
        Provinces
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 pt-4 w-[250px] z-50">
          <div className="max-h-[70vh] overflow-y-auto bg-white border border-border rounded-xl shadow-xl pointer-events-auto">
          <div className="p-2 border-b border-border flex justify-between items-center bg-muted-light/30 sticky top-0 z-10 backdrop-blur-sm">
             <span className="font-semibold px-2">All Provinces</span>
             <Link
               href="/provinces"
               onClick={() => setIsOpen(false)}
               className="text-xs font-medium text-primary hover:underline px-2"
             >
               View Provinces Page
             </Link>
          </div>
          <div className="p-2 flex flex-col gap-1">
            {provinces.map((province) => {
              const provinceLink = `/provinces/${province.slug}`;

              return (
                <div key={province.slug} className="rounded-lg overflow-hidden border border-transparent hover:border-border">
                  <div
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-muted-light/50 transition-colors`}
                    onClick={() => {
                      setIsOpen(false);
                      router.push(provinceLink);
                    }}
                  >
                    <span className="font-medium text-sm text-foreground">{province.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
