export interface ProductSize {
  label: string;
  dimensions: string;
  priceAdjustment: number;
}

export interface ProductColour {
  name: string;
  hex: string;
}

export interface ProductColorOption {
  name: string;
  hex: string;
  image: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  categorySlug: string;
  subcategorySlug?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  sizes: ProductSize[];
  colours: ProductColour[];
  colorOptions?: ProductColorOption[];
  images: string[];
  provinceAvailability: string[];
  tags: string[];
  material: string;
  weight: string;
  assemblyRequired: boolean;
  deliveryEstimate: string;
  featured: boolean;
  inStock: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColour: string;
  image: string;
}
