export interface StoreOffer {
  id: string;
  storeName: string;
  storeLogo?: string;
  priceCash: number;      // Precio efectivo / transferencia
  priceNormal: number;    // Precio normal / tarjetas
  inStock: boolean;
  productUrl: string;
}

export type ProductCategory = 
  | 'Guitarras' 
  | 'Bajos' 
  | 'Teclados y Pianos' 
  | 'Baterías y Percusión' 
  | 'Audio y Grabación'
  | string;

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  imageUrl: string;
  description: string;
  minPrice: number;
  offers: StoreOffer[];
}

export interface ProductFilterParams {
  category?: string;
  store?: string;
  q?: string;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | string;
}
