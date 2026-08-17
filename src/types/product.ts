export interface ProductSize {
  label: string;
  dimensions: string;
  priceAdjustment: number;
}

export interface ProductColour {
  name: string;
  hex: string;
}

export interface ProductLocation {
  provinceCode: string;
  provinceName: string;
  cityName?: string;
  provinceAllowed: boolean;
  cityAllowed: boolean;
  available: boolean;
  cities: string[];
  delivery: boolean;
  pickup: boolean;
}

export interface ProductProvinceAvailability {
  cities?: string[];
  delivery?: boolean;
  pickup?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  categorySlug: string;
  subcategorySlug?: string;
  price?: number;
  priceByProvince: {
    ON?: number;
    QC?: number;
    BC?: number;
    AB?: number;
  };
  provinceAvailability?: string[];
  availability?: Record<string, ProductProvinceAvailability>;
  compareAtPrice?: number;
  currency: string;
  sizes: ProductSize[];
  colours: ProductColour[];
  images: string[];
  tags: string[];
  material: string;
  weight: string;
  assemblyRequired: boolean;
  deliveryEstimate: string;
  featured: boolean;
  inStock: boolean;
  stockQuantity?: number;
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
  selectedDimensions?: string;
  customDimensions?: string;
  image: string;
}
