"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/category";
import { useRouter } from "next/navigation";

interface CategoriesListClientProps {
  categories: Category[];
}

export default function CategoriesListClient({ categories }: CategoriesListClientProps) {
  const router = useRouter();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (slug: string) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  return (
    <div className="flex flex-col gap-4">
      {categories.map((category) => {
        const isExpanded = expandedCategory === category.slug;
        const hasSubcategories = category.subcategories && category.subcategories.length > 0;
        const categoryLink = category.isCustom ? "/custom-build" : `/categories/${category.slug}`;

        return (
          <div
            key={category.slug}
            className="border border-border rounded-xl bg-white overflow-hidden transition-all duration-300"
          >
            <div
              className={`flex items-center justify-between p-4 cursor-pointer hover:bg-muted-light/50 transition-colors ${
                isExpanded ? "bg-muted-light/50" : ""
              }`}
              onClick={() => {
                if (hasSubcategories) {
                  toggleCategory(category.slug);
                } else {
                  router.push(categoryLink);
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted-light shrink-0">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">
                    {category.name}
                  </h2>
                  <p className="text-sm text-muted">
                    {hasSubcategories
                      ? `${category.subcategories!.length} subcategories`
                      : "View category"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!hasSubcategories && (
                  <Link
                    href={categoryLink}
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:underline text-sm font-medium hidden sm:block"
                  >
                    View All
                  </Link>
                )}
                {hasSubcategories ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-6 h-6 text-muted transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-muted"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                )}
              </div>
            </div>

            {hasSubcategories && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? "max-h-[1000px] opacity-100 border-t border-border" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-4 bg-muted-light/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <Link
                      href={categoryLink}
                      className="p-3 rounded-lg border border-border bg-white hover:border-primary/50 hover:shadow-sm transition-all flex items-center justify-between group"
                    >
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        All {category.name}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-muted group-hover:text-primary transition-colors"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>

                    {category.subcategories!.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`${categoryLink}?sub=${sub.slug}`}
                        className="p-3 rounded-lg border border-border bg-white hover:border-primary/50 hover:shadow-sm transition-all flex items-center justify-between group"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {sub.name}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 text-muted group-hover:text-primary transition-colors"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
