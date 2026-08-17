import type { Product, ProductLocation } from "@/types/product";
import productsData from "@/data/products.json";

const products: Product[] = productsData.products as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

const provinceNameByCode: Record<string, string> = {
  ON: "Ontario",
  QC: "Quebec",
  BC: "British Columbia",
  AB: "Alberta",
};

const normalise = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "-");

export function getProductProvinceCodes(product: Product): string[] {
  const explicit = product.provinceAvailability || [];
  if (explicit.length) return explicit;
  return Object.keys(product.priceByProvince).filter((code) => product.priceByProvince[code as keyof Product["priceByProvince"]] !== undefined);
}

export function getProductLocation(product: Product, provinceCode: string, cityName?: string): ProductLocation {
  const provinceName = provinceNameByCode[provinceCode] || provinceCode;
  const locations = product.availability || {};
  const location = locations[provinceCode] || locations[provinceName] || {};
  const cities = location.cities || [];
  const cityAllowed = !cityName || cities.length === 0 || cities.some((city) => normalise(city) === normalise(cityName));
  const provinceAllowed = getProductProvinceCodes(product).includes(provinceCode);
  return {
    provinceCode,
    provinceName,
    cityName,
    provinceAllowed,
    cityAllowed,
    available: provinceAllowed && cityAllowed,
    cities,
    delivery: location.delivery !== false,
    pickup: location.pickup !== false,
  };
}

export function getProductsByProvince(provinceCode: string): Product[] {
  return products.filter((product) => getProductLocation(product, provinceCode).available);
}

export function getProductsByCity(provinceCode: string, cityName: string): Product[] {
  return products.filter((product) => getProductLocation(product, provinceCode, cityName).available);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}
