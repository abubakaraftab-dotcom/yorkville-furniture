import type { Province, City } from "@/types/province";
import provincesData from "@/data/provinces.json";

const provinces: Province[] = provincesData.provinces as Province[];

export function getAllProvinces(): Province[] {
  return provinces;
}

export function getProvinceBySlug(slug: string): Province | undefined {
  return provinces.find((p) => p.slug === slug);
}

export function getProvinceByCode(code: string): Province | undefined {
  return provinces.find((p) => p.code === code);
}

export function getCitiesByProvince(provinceSlug: string): City[] {
  const province = getProvinceBySlug(provinceSlug);
  return province?.cities ?? [];
}

export function getCityBySlug(
  provinceSlug: string,
  citySlug: string
): City | undefined {
  const cities = getCitiesByProvince(provinceSlug);
  return cities.find((c) => c.slug === citySlug);
}
