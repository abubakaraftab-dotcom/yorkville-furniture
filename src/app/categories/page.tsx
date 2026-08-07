import { getAllCategories } from "@/lib/categories";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CategoriesListClient from "./CategoriesListClient";

export const metadata = {
  title: "Categories",
  description: "Browse furniture by category for your home.",
};

export default function CategoriesPage() {
  const categories = getAllCategories();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Categories" }]} />

      <h1 className="text-3xl font-bold font-serif text-foreground mb-2">
        Browse by Category
      </h1>
      <p className="text-muted mb-8">
        Find outstanding premium furniture pieces for each room in your house.
      </p>

      <CategoriesListClient categories={categories} />
    </div>
  );
}
