"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Category } from "@/types/category";
import { useRouter } from "next/navigation";

interface HeaderCategoriesDropdownProps {
  categories: Category[];
}

export default function HeaderCategoriesDropdown({ categories }: HeaderCategoriesDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
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

  const toggleCategory = (slug: string) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          isOpen ? "text-primary" : "text-foreground hover:text-primary"
        }`}
      >
        Categories
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
        <div className="absolute top-full left-0 pt-4 w-[400px] z-50" style={{ pointerEvents: 'auto' }}>
          <div className="max-h-[70vh] overflow-y-auto bg-white border border-border rounded-xl shadow-xl">
          <div className="p-2 border-b border-border flex justify-between items-center bg-muted-light/30 sticky top-0 z-10 backdrop-blur-sm">
             <span className="font-semibold px-2">All Categories</span>
             <Link
               href="/categories"
               onClick={() => setIsOpen(false)}
               className="text-xs font-medium text-primary hover:underline px-2"
             >
               View Categories Page
             </Link>
          </div>
          <div className="p-2 flex flex-col gap-1">
            {categories.map((category) => {
              const isExpanded = expandedCategory === category.slug;
              const hasSubcategories = category.subcategories && category.subcategories.length > 0;
              const categoryLink = category.isCustom ? "/custom-build" : `/categories/${category.slug}`;

              return (
                <div key={category.slug} className="rounded-lg overflow-hidden border border-transparent hover:border-border">
                  <div
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-muted-light/50 transition-colors ${
                      isExpanded ? "bg-muted-light/50" : ""
                    }`}
                    onMouseEnter={() => hasSubcategories && setExpandedCategory(category.slug)}
                    onClick={() => {
                      if (hasSubcategories) {
                        setExpandedCategory(category.slug);
                      } else {
                        setIsOpen(false);
                        router.push(categoryLink);
                      }
                    }}
                  >
                    <span className="font-medium text-sm text-foreground">{category.name}</span>
                    {hasSubcategories && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`w-4 h-4 text-muted transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    )}
                  </div>

                  {hasSubcategories && (
                    <div
                      onMouseEnter={() => setExpandedCategory(category.slug)}
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="bg-muted-light/20 p-2 pl-4 border-l-2 border-primary/20 ml-2 mb-2 flex flex-col gap-1">
                        <Link
                          href={categoryLink}
                          onClick={() => setIsOpen(false)}
                          className="p-2 rounded-md hover:bg-white text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center justify-between"
                        >
                          All {category.name}
                        </Link>
                        {category.subcategories!.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`${categoryLink}?sub=${sub.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-md hover:bg-white text-sm text-muted hover:text-primary transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
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
