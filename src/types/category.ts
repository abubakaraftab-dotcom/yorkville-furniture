export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  parentSlug: string | null;
  order: number;
  featured: boolean;
  isCustom?: boolean;
}
