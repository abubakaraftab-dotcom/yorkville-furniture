export interface City {
  slug: string;
  name: string;
}

export interface Province {
  code: string;
  slug: string;
  name: string;
  taxRate: number;
  taxLabel: string;
  cities: City[];
  deliveryNote: string;
}
