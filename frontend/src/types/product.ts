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
  section?: 'Instrumentos' | 'Piezas y Repuestos' | 'Equipos de sonido' | string;
  subCategory?: string;
  imageUrl: string;
  description: string;
  minPrice: number;
  offers: StoreOffer[];
}

export interface ProductFilterParams {
  category?: string;
  section?: string;
  store?: string;
  q?: string;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | string;
}
