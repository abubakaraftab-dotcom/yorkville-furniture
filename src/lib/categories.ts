import type { Category } from "@/types/category";
import categoriesData from "@/data/categories.json";
import type { Product } from "@/types/product";
import { getProductsByProvince, getProductProvinceCodes } from "@/lib/products";

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

/**
 * Spec rule: show only categories (and subcategories) that have at least
 * one product available in the selected province. Subcategory lists
 * always include an "All <category>" entry that opens the category page.
 */
export function getCategoriesByProvince(provinceCode: string): Category[] {
  const localProducts = getProductsByProvince(provinceCode);
  const availableProvinceCodes = new Set(
    localProducts.flatMap((product) => getProductProvinceCodes(product))
  );
  // categorySlug may be the top-level category only, with the subcategory
  // stored in a separate subcategorySlug field — match against both.
  const slugMatches = (product: Product, cat: string, sub: string | null): boolean => {
    if (product.categorySlug !== cat) return false;
    if (sub === null) return true; // top-level category page
    return product.subcategorySlug === sub || product.categorySlug === `${cat}/${sub}`;
  };

  const inProvince = (cat: string, sub: string | null) =>
    localProducts.some(
      (product) =>
        slugMatches(product, cat, sub) &&
        getProductProvinceCodes(product).includes(provinceCode)
    );

  return categories
    .filter((category) => {
      if (inProvince(category.slug, null)) return true;
      return category.subcategories?.some((sub) => inProvince(category.slug, sub.slug)) ?? false;
    })
    .map((category) => ({
      ...category,
      subcategories: category.subcategories?.filter((sub) =>
        inProvince(category.slug, sub.slug)
      ),
    }))
    .filter((category) =>
      inProvince(category.slug, null) ||
      (category.subcategories !== undefined && category.subcategories.length > 0)
    )
    .sort((a, b) => a.order - b.order);
}
