"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Category } from "@/types/category";
import { Province } from "@/types/province";
import { useRouter } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { href: string; label: string }[];
  categories?: Category[];
  provinces?: Province[];
}

export default function MobileMenu({ isOpen, onClose, navLinks, categories = [], provinces = [] }: MobileMenuProps) {
  const router = useRouter();
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [provincesExpanded, setProvincesExpanded] = useState(false);
  const [expandedCategorySlug, setExpandedCategorySlug] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Reset expansions when closed
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategoriesExpanded(false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProvincesExpanded(false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedCategorySlug(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSubcategory = (slug: string) => {
    setExpandedCategorySlug(expandedCategorySlug === slug ? null : slug);
  };

  return (
    <div className="fixed inset-0 z-[100] lg:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-80 max-w-[80vw] bg-white shadow-xl flex flex-col h-full ml-auto animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border bg-white">
          <span className="text-lg font-bold text-primary">Menu</span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted hover:text-foreground cursor-pointer"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-1">
              {navLinks.map((link) => {
                if (link.label === "Categories" && categories.length > 0) {
                  return (
                    <li key="categories-accordion">
                      <button
                        onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                        className="w-full flex items-center justify-between px-4 py-3 text-foreground hover:bg-muted-light/50 rounded-lg transition-colors font-medium text-left"
                      >
                        Categories
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className={`w-5 h-5 transition-transform duration-200 text-muted ${categoriesExpanded ? "rotate-180" : ""}`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>

                      {categoriesExpanded && (
                        <div className="mt-1 ml-2 border-l-2 border-border pl-2 space-y-1 flex flex-col">
                          <Link
                            href="/categories"
                            onClick={onClose}
                            className="block px-4 py-2 text-sm font-semibold text-primary hover:bg-muted-light/50 rounded-md transition-colors"
                          >
                            All Categories
                          </Link>
                          {categories.map((cat) => {
                            const isExpanded = expandedCategorySlug === cat.slug;
                            const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
                            const catLink = cat.isCustom ? "/custom-build" : `/categories/${cat.slug}`;

                            return (
                              <div key={cat.slug}>
                                <button
                                  onClick={() => {
                                    if (hasSubcategories) {
                                      toggleSubcategory(cat.slug);
                                    } else {
                                      onClose();
                                      router.push(catLink);
                                    }
                                  }}
                                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-muted-light/50 rounded-md transition-colors text-left"
                                >
                                  {cat.name}
                                  {hasSubcategories && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className={`w-4 h-4 text-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                  )}
                                </button>

                                {hasSubcategories && isExpanded && (
                                  <div className="mt-1 ml-4 border-l-2 border-border pl-2 space-y-1">
                                    <Link
                                      href={catLink}
                                      onClick={onClose}
                                      className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted-light/50 rounded-md transition-colors"
                                    >
                                      All {cat.name}
                                    </Link>
                                    {cat.subcategories!.map(sub => (
                                      <Link
                                        key={sub.slug}
                                        href={`${catLink}?sub=${sub.slug}`}
                                        onClick={onClose}
                                        className="block px-4 py-2 text-sm text-muted hover:text-primary hover:bg-muted-light/50 rounded-md transition-colors"
                                      >
                                        {sub.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  );
                }

                if (link.label === "Provinces" && provinces.length > 0) {
                  return (
                    <li key="provinces-accordion">
                      <button
                        onClick={() => setProvincesExpanded(!provincesExpanded)}
                        className="w-full flex items-center justify-between px-4 py-3 text-foreground hover:bg-muted-light/50 rounded-lg transition-colors font-medium text-left"
                      >
                        Provinces
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className={`w-5 h-5 transition-transform duration-200 text-muted ${provincesExpanded ? "rotate-180" : ""}`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>

                      {provincesExpanded && (
                        <div className="mt-1 ml-2 border-l-2 border-border pl-2 space-y-1 flex flex-col">
                          <Link
                            href="/provinces"
                            onClick={onClose}
                            className="block px-4 py-2 text-sm font-semibold text-primary hover:bg-muted-light/50 rounded-md transition-colors"
                          >
                            All Provinces
                          </Link>
                          {provinces.map((prov) => {
                            const provLink = `/provinces/${prov.slug}`;
                            return (
                              <button
                                key={prov.slug}
                                onClick={() => {
                                  onClose();
                                  router.push(provLink);
                                }}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-muted-light/50 rounded-md transition-colors text-left"
                              >
                                {prov.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="block px-4 py-3 text-foreground hover:bg-muted-light/50 hover:text-primary rounded-lg transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-border bg-white mt-auto">
          <Link
            href="/cart"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-semibold justify-center hover:bg-primary/90 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
