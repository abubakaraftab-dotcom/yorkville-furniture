import type { Category } from "@/types/category";
import categoriesData from "@/data/categories.json";

const categories: Category[] = categoriesData.categories as Category[];

export function getAllCategories(): Category[] {
  return categories.sort((a, b) => a.order - b.order);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getFeaturedCategories(): Category[] {
  return categories
    .filter((c) => c.featured)
    .sort((a, b) => a.order - b.order);
}
