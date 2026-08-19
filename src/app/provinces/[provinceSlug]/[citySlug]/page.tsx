import { getProvinceBySlug, getAllProvinces, getCityBySlug } from "@/lib/provinces";
import { getProductsByCity } from "@/lib/products";
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
    title: `Furniture Availability in ${city.name}, ${province.name}`,
    description: `Shop premium quality wood furniture delivered straight to your door in ${city.name}, ${province.name}. Payment on delivery.`,
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

  const products = getProductsByCity(province.code, city.name);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs
        items={[
          { label: "Shop by Province", href: "/provinces" },
          { label: province.name, href: `/provinces/${province.slug}` },
          { label: city.name },
        ]}
      />

      <div className="relative mb-10 overflow-hidden rounded-3xl border border-[#d8c6b3] bg-[#2b2926] px-6 py-12 text-center text-white shadow-xl sm:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(183,135,83,0.45),transparent_48%),linear-gradient(135deg,rgba(28,31,30,0.98),rgba(73,58,44,0.88))]" />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#e5c49d]">Yorkville Furniture Canada · Shop by City</p>
          <h1 className="mt-3 text-3xl font-bold font-serif sm:text-5xl">Furniture Availability in {city.name}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80">Curated furniture for homes across {city.name}, {province.name}. Browse products that are currently available in this exact delivery area.</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#e5c49d]">Inspired by the character of {city.name}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold font-serif text-foreground mb-6">
        Available items in {city.name}
      </h2>

      <ProductGrid
        products={products}
        emptyMessage={`No items currently available in ${city.name}.`}
      />
    </div>
  );
}
