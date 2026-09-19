import axios from "axios";
import type { Product, ProductFilterParams } from "../types/product";

const API_BASE_URL = "/api";

export const productService = {
  // Obtener listado de productos con filtros
  getProducts: async (params?: ProductFilterParams): Promise<Product[]> => {
    try {
      const response = await axios.get<Product[]>(`${API_BASE_URL}/products`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.warn("No se pudo contactar con la API del backend, usando datos locales de respaldo:", error);
      return fallbackProducts(params);
    }
  },

  // Obtener producto por ID
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await axios.get<Product>(`${API_BASE_URL}/products/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`No se pudo contactar con la API para producto ${id}, usando respaldo:`, error);
      const found = FALLBACK_PRODUCTS.find((p) => p.id === id);
      if (found) return found;
      throw new Error("Producto no encontrado");
    }
  },

  // Obtener lista de categorías
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await axios.get<string[]>(`${API_BASE_URL}/categories`);
      return response.data;
    } catch {
      return Array.from(new Set(FALLBACK_PRODUCTS.map((p) => p.category)));
    }
  },

  // Obtener lista de tiendas
  getStores: async (): Promise<string[]> => {
    try {
      const response = await axios.get<string[]>(`${API_BASE_URL}/stores`);
      return response.data;
    } catch {
      const stores = new Set<string>();
      FALLBACK_PRODUCTS.forEach((p) => p.offers.forEach((o) => stores.add(o.storeName)));
      return Array.from(stores);
    }
  },
};

// Datos de respaldo en caso de que el backend no esté encendido durante pruebas
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fender-player-stratocaster",
    name: "Player Stratocaster Polar White Maple",
    brand: "Fender",
    category: "Guitarras",
    imageUrl: "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80",
    description: "El sonido inspirador de una Stratocaster es uno de los fundamentos de Fender. Con agudos de campana, medios contundentes y graves robustos, combinados con una articulación nítida.",
    minPrice: 789990,
    offers: [
      {
        id: "offer-1",
        storeName: "Audiomusica",
        priceCash: 789990,
        priceNormal: 829990,
        inStock: true,
        productUrl: "https://www.audiomusica.com",
      },
      {
        id: "offer-2",
        storeName: "Casa Amarilla",
        priceCash: 799990,
        priceNormal: 839990,
        inStock: true,
        productUrl: "https://www.casamarilla.cl",
      },
      {
        id: "offer-3",
        storeName: "Overdrive",
        priceCash: 819990,
        priceNormal: 849990,
        inStock: false,
        productUrl: "https://www.overdrive.cl",
      },
    ],
  },
  {
    id: "gibson-les-paul-standard-50s",
    name: "Les Paul Standard 50s Heritage Cherry Sunburst",
    brand: "Gibson",
    category: "Guitarras",
    imageUrl: "https://images.unsplash.com/photo-1525201548112-c7b602038c1a?auto=format&fit=crop&w=600&q=80",
    description: "Regresa al diseño clásico que hizo legendaria a la Les Paul. Con cuerpo de caoba maciza, tapa de arce figurado y pastillas calibradas Burstbucker 1 y 2.",
    minPrice: 2490000,
    offers: [
      {
        id: "offer-4",
        storeName: "Promusic",
        priceCash: 2490000,
        priceNormal: 2599990,
        inStock: true,
        productUrl: "https://promusic.cl",
      },
      {
        id: "offer-5",
        storeName: "Audiomusica",
        priceCash: 2549990,
        priceNormal: 2649990,
        inStock: true,
        productUrl: "https://www.audiomusica.com",
      },
    ],
  },
  {
    id: "yamaha-c40-ii",
    name: "Guitarra Clásica C40 II Acústica",
    brand: "Yamaha",
    category: "Guitarras",
    imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80",
    description: "Una de las guitarras clásicas más vendidas y recomendadas para estudiantes y músicos intermedios por su excelente relación precio-calidad y sonoridad equilibrada.",
    minPrice: 139990,
    offers: [
      {
        id: "offer-6",
        storeName: "Casa Amarilla",
        priceCash: 139990,
        priceNormal: 149990,
        inStock: true,
        productUrl: "https://www.casamarilla.cl",
      },
      {
        id: "offer-7",
        storeName: "Audiomusica",
        priceCash: 144990,
        priceNormal: 154990,
        inStock: true,
        productUrl: "https://www.audiomusica.com",
      },
      {
        id: "offer-8",
        storeName: "Falabella",
        priceCash: 149990,
        priceNormal: 159990,
        inStock: true,
        productUrl: "https://www.falabella.com",
      },
    ],
  },
  {
    id: "fender-player-jazz-bass",
    name: "Player Jazz Bass 3-Color Sunburst Pau Ferro",
    brand: "Fender",
    category: "Bajos",
    imageUrl: "https://images.unsplash.com/photo-1520523839898-50712743e9a7?auto=format&fit=crop&w=600&q=80",
    description: "Con sus dos pastillas single-coil y su suave sensación de tacto, el Player Jazz Bass es un instrumento inspirador con el estilo clásico y versátil que demandan bajistas de todo el mundo.",
    minPrice: 849990,
    offers: [
      {
        id: "offer-11",
        storeName: "Audiomusica",
        priceCash: 849990,
        priceNormal: 899990,
        inStock: true,
        productUrl: "https://www.audiomusica.com",
      },
      {
        id: "offer-12",
        storeName: "Casa Amarilla",
        priceCash: 859990,
        priceNormal: 909990,
        inStock: true,
        productUrl: "https://www.casamarilla.cl",
      },
    ],
  },
  {
    id: "yamaha-p45-digital-piano",
    name: "Piano Digital P-45 88 Teclas Contrapesadas",
    brand: "Yamaha",
    category: "Teclados y Pianos",
    imageUrl: "https://images.unsplash.com/photo-1520523839898-50712743e9a7?auto=format&fit=crop&w=600&q=80",
    description: "El teclado Graded Hammer Standard (GHS) de 88 teclas ofrece una sensación de pulsación realista similar a la de un piano acústico tradicional en un formato compacto.",
    minPrice: 519990,
    offers: [
      {
        id: "offer-15",
        storeName: "Audiomusica",
        priceCash: 519990,
        priceNormal: 549990,
        inStock: true,
        productUrl: "https://www.audiomusica.com",
      },
      {
        id: "offer-16",
        storeName: "Casa Amarilla",
        priceCash: 529990,
        priceNormal: 559990,
        inStock: true,
        productUrl: "https://www.casamarilla.cl",
      },
    ],
  },
  {
    id: "roland-td-07kv",
    name: "Batería Electrónica V-Drums TD-07KV",
    brand: "Roland",
    category: "Baterías y Percusión",
    imageUrl: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=600&q=80",
    description: "El kit V-Drums TD-07KV combina pads con parches de malla de doble capa característicos de Roland con sonidos profesionales y conectividad Bluetooth.",
    minPrice: 949990,
    offers: [
      {
        id: "offer-20",
        storeName: "Audiomusica",
        priceCash: 949990,
        priceNormal: 999990,
        inStock: true,
        productUrl: "https://www.audiomusica.com",
      },
      {
        id: "offer-21",
        storeName: "Promusic",
        priceCash: 969990,
        priceNormal: 1019990,
        inStock: true,
        productUrl: "https://promusic.cl",
      },
    ],
  },
  {
    id: "shure-sm7b",
    name: "Micrófono Dinámico Vocal SM7B para Estudio y Broadcast",
    brand: "Shure",
    category: "Audio y Grabación",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80",
    description: "El estándar de la industria musical y streaming para voces cálidas, suaves y precisas con rechazo electromagnético excepcional.",
    minPrice: 429990,
    offers: [
      {
        id: "offer-24",
        storeName: "Promusic",
        priceCash: 429990,
        priceNormal: 459990,
        inStock: true,
        productUrl: "https://promusic.cl",
      },
      {
        id: "offer-25",
        storeName: "Audiomusica",
        priceCash: 439990,
        priceNormal: 469990,
        inStock: true,
        productUrl: "https://www.audiomusica.com",
      },
    ],
  },
  {
    id: "focusrite-scarlett-2i2-4th-gen",
    name: "Interfaz de Audio Scarlett 2i2 4th Gen USB",
    brand: "Focusrite",
    category: "Audio y Grabación",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80",
    description: "La interfaz de audio más popular para músicos y productores caseros, ahora con conversores de rango dinámico de 120 dB con calidad de estudio y modo Air rediseñado.",
    minPrice: 199990,
    offers: [
      {
        id: "offer-27",
        storeName: "Audiomusica",
        priceCash: 199990,
        priceNormal: 219990,
        inStock: true,
        productUrl: "https://www.audiomusica.com",
      },
      {
        id: "offer-28",
        storeName: "Promusic",
        priceCash: 204990,
        priceNormal: 224990,
        inStock: true,
        productUrl: "https://promusic.cl",
      },
    ],
  },
];

function fallbackProducts(params?: ProductFilterParams): Product[] {
  let list = [...FALLBACK_PRODUCTS];
  if (!params) return list;

  if (params.category && params.category !== "Todas") {
    list = list.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
  }

  if (params.store && params.store !== "Todas") {
    list = list.filter((p) =>
      p.offers.some((o) => o.storeName.toLowerCase() === params.store!.toLowerCase() && o.inStock)
    );
  }

  if (params.q && params.q.trim()) {
    const q = params.q.toLowerCase();
    list = list.filter((p) =>
      `${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase().includes(q)
    );
  }

  if (params.sort === "price_asc") {
    list.sort((a, b) => a.minPrice - b.minPrice);
  } else if (params.sort === "price_desc") {
    list.sort((a, b) => b.minPrice - a.minPrice);
  } else if (params.sort === "name_asc") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}
