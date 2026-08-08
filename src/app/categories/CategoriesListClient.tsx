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
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
      {categories.map((category) => {
        const isExpanded = expandedCategory === category.slug;
        const hasSubcategories = category.subcategories && category.subcategories.length > 0;
        const categoryLink = category.isCustom ? "/custom-build" : `/categories/${category.slug}`;

        return (
          <div
            key={category.slug}
            className="flex flex-col border border-border rounded-xl bg-white overflow-hidden transition-all duration-300"
          >
            <div
              className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-muted-light"
              onClick={() => {
                if (hasSubcategories) {
                  toggleCategory(category.slug);
                } else {
                  router.push(categoryLink);
                }
              }}
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end">
                <h3 className="text-white font-semibold text-sm leading-tight">
                  {category.name}
                </h3>
                {hasSubcategories && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-white shrink-0 transition-transform duration-300 ml-2 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                )}
              </div>
            </div>

            {hasSubcategories && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out bg-muted-light/30 ${
                  isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-2 flex flex-col gap-1">
                  <Link
                    href={categoryLink}
                    className="p-2 rounded-md text-xs font-medium text-foreground hover:bg-white hover:text-primary transition-colors flex justify-between items-center"
                  >
                    <span>All {category.name}</span>
                  </Link>

                  {category.subcategories!.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`${categoryLink}?sub=${sub.slug}`}
                      className="p-2 rounded-md text-xs text-muted hover:bg-white hover:text-primary transition-colors flex justify-between items-center"
                    >
                      <span>{sub.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
