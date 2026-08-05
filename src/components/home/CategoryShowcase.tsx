import Link from "next/link";
import Image from "next/image";
import { getFeaturedCategories } from "@/lib/categories";

export default function CategoryShowcase() {
  const categories = getFeaturedCategories().slice(0, 8);

  return (
    <section className="py-16 bg-muted-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">Shop by Category</h2>
          <p className="text-muted mt-2">Find the perfect piece for every room</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={category.isCustom ? "/custom-build" : `/categories/${category.slug}`}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-white border border-border hover:shadow-lg transition-shadow"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm sm:text-base">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="text-primary font-semibold hover:underline"
          >
            View All Categories &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
