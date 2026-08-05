import { getCategoryBySlug, getAllCategories } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";
import { notFound } from "next/navigation";
import CategoryProductsClient from "@/components/product/CategoryProductsClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: `${category.name} | Categories`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = getProductsByCategory(slug);

  return <CategoryProductsClient category={category} initialProducts={products} />;
}
