export interface Product {
  name: string | null;
  price: number | null;
  normalPrice: number | null;
  brand: string | null;
  imageUrl: string | null;
  url: string | null;
  localImagePath: string | null;
  imageBase64: string | null;
  description: string | null;
  isFlexible: string | null;
}

export interface PageResult {
  products: Product[];
  hasNextPage: boolean;
}
