import { getProvinceBySlug, getAllProvinces, getCityBySlug } from "@/lib/provinces";
import { getProductsByProvince } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const provinces = getAllProvinces();
  const paths: { provinceSlug: string; citySlug: string }[] = [];

  provinces.forEach(province => {
    province.cities.forEach(city => {
      paths.push({
        provinceSlug: province.slug,
        citySlug: city.slug,
      });
    });
  });

  return paths;
}

interface PageProps {
  params: Promise<{ provinceSlug: string; citySlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { provinceSlug, citySlug } = await params;
  const province = getProvinceBySlug(provinceSlug);
  if (!province) return {};
  const city = getCityBySlug(provinceSlug, citySlug);
  if (!city) return {};

  return {
    title: `Furniture Delivery in ${city.name}, ${province.name}`,
    description: `Shop luxury handcrafted wood furniture delivered straight to your door in ${city.name}, ${province.name}. Payment on delivery.`,
  };
}

export default async function CityPage({ params }: PageProps) {
  const { provinceSlug, citySlug } = await params;
  const province = getProvinceBySlug(provinceSlug);
  if (!province) {
    notFound();
  }

  const city = getCityBySlug(provinceSlug, citySlug);
  if (!city) {
    notFound();
  }

  const products = getProductsByProvince(province.code);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs
        items={[
          { label: "Provinces", href: "/provinces" },
          { label: province.name, href: `/provinces/${province.slug}` },
          { label: city.name },
        ]}
      />

      <div className="mb-10 text-center max-w-2xl mx-auto bg-primary/5 rounded-2xl p-6 border border-primary/10">
        <h1 className="text-3xl font-bold font-serif text-foreground">
          Furniture Delivery in {city.name}, {province.code}
        </h1>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          Need premium handcrafted dining tables, bed frames, or sectionals? We deliver directly to {city.name} households. Order online and pay cash when your furniture arrives!
        </p>
      </div>

      <h2 className="text-2xl font-bold font-serif text-foreground mb-6">
        Available items in {city.name}
      </h2>

      <ProductGrid
        products={products}
        emptyMessage={`No items currently available for delivery in ${city.name}.`}
      />
    </div>
  );
}
