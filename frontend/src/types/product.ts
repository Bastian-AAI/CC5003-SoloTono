export interface StoreOffer {
  id: string;
  storeName: string;
  storeLogo?: string;
  priceCash: number;      // Precio efectivo / transferencia
  priceNormal: number;    // Precio normal / tarjetas
  inStock: boolean;
  productUrl: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  categorySlug?: string;
  section?: "Instrumentos" | "Piezas y Repuestos" | "Equipos de sonido" | string;
  sectionSlug?: string;
  subCategory?: string;
  groupSlug?: string;
  imageUrl: string;
  description: string;
  minPrice: number;
  offers: StoreOffer[];
}

export interface ProductFilterParams {
  category?: string;
  section?: string;
  group?: string;
  brand?: string;
  store?: string;
  q?: string;
  sort?: "price_asc" | "price_desc" | "name_asc" | string;
  in_stock?: boolean | string;
}

export interface TaxonomyCategory {
  id: number;
  name: string;
  slug: string;
  ordering: number;
}

export interface TaxonomyGroup {
  id: number;
  name: string;
  slug: string;
  ordering: number;
  categories: TaxonomyCategory[];
}

export interface TaxonomySection {
  id: number;
  name: string;
  slug: string;
  ordering: number;
  groups: TaxonomyGroup[];
}

export interface PriceHistoryPoint {
  id: number;
  timestamp: string;
  inStock: boolean;
  priceCash: number;
  priceNormal: number;
  storeName: string;
  entityId: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  notes: string;
  targetPrice: number | null;
  createdAt: string;
  product: Product | null;
}

export interface StoreDetail {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  scraperClass: string;
  engineType: string;
  isActive: boolean;
}

export interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  groupId: number | null;
  ordering: number;
}
