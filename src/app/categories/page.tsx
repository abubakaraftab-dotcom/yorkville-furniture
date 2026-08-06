import Link from "next/link";
import Image from "next/image";
import { getAllCategories } from "@/lib/categories";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "Categories",
  description: "Browse furniture by category for your home.",
};

export default function CategoriesPage() {
  const categories = getAllCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Categories" }]} />

      <h1 className="text-3xl font-bold font-serif text-foreground mb-2">
        Browse by Category
      </h1>
      <p className="text-muted mb-8">
        Find outstanding handcrafted furniture pieces for each room in your house.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={category.isCustom ? "/custom-build" : `/categories/${category.slug}`}
            className="group block bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
          >
            <div className="relative aspect-[4/3] bg-muted-light">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
              )}
            </div>
            <div className="p-4">
              <h2 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {category.name}
              </h2>
              {category.subcategories && category.subcategories.length > 0 && (
                <p className="text-sm text-muted mt-1 truncate">
                  {category.subcategories.map(s => s.name).join(", ")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
