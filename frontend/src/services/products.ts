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
    } catch {
      return fallbackProducts(params);
    }
  },

  // Obtener producto por ID
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await axios.get<Product>(`${API_BASE_URL}/products/${id}`);
      return response.data;
    } catch {
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

// Datos de respaldo con la misma taxonomía que el backend
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fender-player-stratocaster",
    name: "Guitarra Eléctrica Player Stratocaster Polar White Maple",
    brand: "Fender",
    category: "Cuerda",
    section: "Instrumentos",
    subCategory: "Guitarras Eléctricas",
    imageUrl: "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80",
    description: "El sonido inspirador de una Stratocaster es uno de los fundamentos de Fender. Con agudos de campana, medios contundentes y graves robustos.",
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
    ],
  },
  {
    id: "gibson-les-paul-standard-50s",
    name: "Guitarra Eléctrica Les Paul Standard 50s Heritage Cherry Sunburst",
    brand: "Gibson",
    category: "Cuerda",
    section: "Instrumentos",
    subCategory: "Guitarras Eléctricas",
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
    category: "Cuerda",
    section: "Instrumentos",
    subCategory: "Guitarras Clásicas",
    imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80",
    description: "Una de las guitarras clásicas más recomendadas para estudiantes y músicos por su excelente relación precio-calidad.",
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
    ],
  },
  {
    id: "yamaha-yas-280",
    name: "Saxofón Alto YAS-280 Laqueado Dorado",
    brand: "Yamaha",
    category: "Aire",
    section: "Instrumentos",
    subCategory: "Saxofones",
    imageUrl: "https://images.unsplash.com/photo-1525994886773-080587e161c2?auto=format&fit=crop&w=600&q=80",
    description: "El YAS-280 ofrece un comienzo perfecto gracias a su afinación precisa, peso ligero y mecanismo ergonómico.",
    minPrice: 1190000,
    offers: [
      {
        id: "offer-a1",
        storeName: "Audiomusica",
        priceCash: 1190000,
        priceNormal: 1249990,
        inStock: true,
        productUrl: "https://www.audiomusica.com",
      },
    ],
  },
  {
    id: "roland-td-07kv",
    name: "Batería Electrónica V-Drums TD-07KV",
    brand: "Roland",
    category: "Percusión",
    section: "Instrumentos",
    subCategory: "Baterías Electrónicas",
    imageUrl: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=600&q=80",
    description: "Pads con parches de malla de doble capa con sonidos profesionales y conectividad Bluetooth.",
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
    ],
  },
  {
    id: "yamaha-p45-digital-piano",
    name: "Piano Digital P-45 88 Teclas Contrapesadas",
    brand: "Yamaha",
    category: "Teclas",
    section: "Instrumentos",
    subCategory: "Pianos Digitales",
    imageUrl: "https://images.unsplash.com/photo-1520523839898-50712743e9a7?auto=format&fit=crop&w=600&q=80",
    description: "Teclado Graded Hammer Standard (GHS) de 88 teclas con sensación realista de piano tradicional.",
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
    ],
  },
  {
    id: "ernie-ball-regular-slinky",
    name: "Cuerdas para Guitarra Eléctrica Regular Slinky 10-46",
    brand: "Ernie Ball",
    category: "Cuerdas y Afinación",
    section: "Piezas y Repuestos",
    subCategory: "Cuerdas Guitarra y Bajo",
    imageUrl: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=600&q=80",
    description: "El juego de cuerdas para guitarra eléctrica más elegido por guitarristas de todo el mundo.",
    minPrice: 8990,
    offers: [
      {
        id: "offer-r1",
        storeName: "Overdrive",
        priceCash: 8990,
        priceNormal: 9990,
        inStock: true,
        productUrl: "https://www.overdrive.cl",
      },
    ],
  },
  {
    id: "fender-mustang-lt25",
    name: "Amplificador de Guitarra Mustang LT25 25W Digital",
    brand: "Fender",
    category: "Amplificación",
    section: "Equipos de sonido",
    subCategory: "Amplificadores de Guitarra",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80",
    description: "Amplificador digital de modelado con 50 presets y pantalla a color para ensayar o grabar.",
    minPrice: 169990,
    offers: [
      {
        id: "offer-s1",
        storeName: "Audiomusica",
        priceCash: 169990,
        priceNormal: 179990,
        inStock: true,
        productUrl: "https://www.audiomusica.com",
      },
    ],
  },
  {
    id: "shure-sm7b",
    name: "Micrófono Dinámico Vocal SM7B para Estudio y Broadcast",
    brand: "Shure",
    category: "Grabación y Estudio",
    section: "Equipos de sonido",
    subCategory: "Micrófonos de Estudio",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80",
    description: "El estándar de la industria musical y streaming para voces cálidas y suaves.",
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
    ],
  },
];

function fallbackProducts(params?: ProductFilterParams): Product[] {
  let list = [...FALLBACK_PRODUCTS];
  if (!params) return list;

  if (params.section && params.section !== "Todas") {
    list = list.filter((p) => p.section?.toLowerCase() === params.section!.toLowerCase());
  }

  if (params.category && params.category !== "Todas") {
    const catLower = params.category.toLowerCase();
    list = list.filter(
      (p) => p.category.toLowerCase() === catLower || p.subCategory?.toLowerCase() === catLower
    );
  }

  if (params.store && params.store !== "Todas") {
    list = list.filter((p) =>
      p.offers.some((o) => o.storeName.toLowerCase() === params.store!.toLowerCase() && o.inStock)
    );
  }

  if (params.q && params.q.trim()) {
    const searchTerms = params.q.toLowerCase().split(" ").filter(Boolean);
    list = list.filter((p) => {
      const text = `${p.name} ${p.brand} ${p.category} ${p.subCategory || ""} ${p.section || ""} ${p.description}`.toLowerCase();
      return searchTerms.every((term) => text.includes(term));
    });
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
