import { getProvinceBySlug, getAllProvinces } from "@/lib/provinces";
import { getProductsByProvince } from "@/lib/products";
import { notFound } from "next/navigation";
import ProvinceDetailClient from "@/components/product/ProvinceDetailClient";
import type { Metadata } from "next";

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
    title: `Handcrafted Furniture in ${province.name}`,
    description: `Shop high-quality handcrafted furniture in ${province.name}. ${province.deliveryNote}. Cash on delivery.`,
  };
}

export default async function ProvincePage({ params }: PageProps) {
  const { provinceSlug } = await params;
  const province = getProvinceBySlug(provinceSlug);

  if (!province) {
    notFound();
  }

  const products = getProductsByProvince(province.code);

  return <ProvinceDetailClient province={province} products={products} />;
}
