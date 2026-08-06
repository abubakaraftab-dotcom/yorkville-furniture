export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  subcategories?: { slug: string; name: string }[];
  order: number;
  featured: boolean;
  isCustom?: boolean;
}
