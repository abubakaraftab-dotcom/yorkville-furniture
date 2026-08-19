import Link from "next/link";
import { getProvinceBySlug, getAllProvinces, getCityBySlug } from "@/lib/provinces";
import { getProductsByCity } from "@/lib/products";
import CityDetailClient from "@/components/product/CityDetailClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const provinces = getAllProvinces();
  const paths: { provinceSlug: string; citySlug: string }[] = [];

  provinces.forEach((province) => {
    province.cities.forEach((city) => {
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

function LocationNotFound({ title }: { title: string }) {
  return (
    <div className="bg-[#FAFAF9] min-h-[40vh] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-5xl mb-4">📍</p>
        <h1 className="text-2xl font-bold font-serif text-foreground">Location not found</h1>
        <p className="text-sm text-muted mt-2">{title}</p>
        <Link
          href="/provinces"
          className="mt-6 inline-flex items-center gap-1.5 bg-primary text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          Browse all provinces
        </Link>
      </div>
    </div>
  );
}

export default async function CityPage({ params }: PageProps) {
  const { provinceSlug, citySlug } = await params;
  const province = getProvinceBySlug(provinceSlug);
  if (!province) {
    return (
      <LocationNotFound title={`No province found matching “${provinceSlug}”.`} />
    );
  }

  const city = getCityBySlug(provinceSlug, citySlug);
  if (!city) {
    return (
      <LocationNotFound title={`No city found matching “${citySlug}” in ${province.name}.`} />
    );
  }

  const products = getProductsByCity(province.code, city.name);

  return <CityDetailClient province={province} city={city} products={products} />;
}
