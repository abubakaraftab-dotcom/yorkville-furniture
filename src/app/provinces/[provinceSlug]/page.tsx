import Link from "next/link";
import { getProvinceBySlug, getAllProvinces } from "@/lib/provinces";
import { getProductsByProvince } from "@/lib/products";
import ProvinceDetailClient from "@/components/product/ProvinceDetailClient";
import type { Metadata } from "next";

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

export async function generateStaticParams() {
  const provinces = getAllProvinces();
  return provinces.map((province) => ({
    provinceSlug: province.slug,
  }));
}

interface PageProps {
  params: Promise<{ provinceSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { provinceSlug } = await params;
  const province = getProvinceBySlug(provinceSlug);
  if (!province) return {};

  return {
    title: `Premium Furniture in ${province.name}`,
    description: `Shop high-quality premium furniture in ${province.name}. ${province.deliveryNote}. Cash on delivery.`,
  };
}

export default async function ProvincePage({ params }: PageProps) {
  const { provinceSlug } = await params;
  const province = getProvinceBySlug(provinceSlug);

  if (!province) {
    return <LocationNotFound title={`No province found matching “${provinceSlug}”.`} />;
  }

  const products = getProductsByProvince(province.code);

  return <ProvinceDetailClient province={province} products={products} />;
}
