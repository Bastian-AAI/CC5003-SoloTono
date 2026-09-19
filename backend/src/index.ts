import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initialProducts, type Product } from "./data/productsData.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Logger simple para peticiones
app.use((req: Request, _res: Response, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "CC5003-SoloTono API is up and running!",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/categories - Obtener lista de categorías únicas
app.get("/api/categories", (_req: Request, res: Response) => {
  const categories = Array.from(new Set(initialProducts.map((p) => p.category)));
  res.json(categories);
});

// GET /api/stores - Obtener lista de tiendas únicas
app.get("/api/stores", (_req: Request, res: Response) => {
  const storeNames = new Set<string>();
  initialProducts.forEach((p) => {
    p.offers.forEach((o) => storeNames.add(o.storeName));
  });
  res.json(Array.from(storeNames));
});

// GET /api/products - Listado con filtros y búsqueda
app.get("/api/products", (req: Request, res: Response) => {
  let products: Product[] = [...initialProducts];
  const { category, store, q, sort } = req.query;

  // Filtrado por categoría
  if (typeof category === "string" && category.trim() !== "" && category !== "Todas") {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  // Filtrado por tienda disponible
  if (typeof store === "string" && store.trim() !== "" && store !== "Todas") {
    products = products.filter((p) =>
      p.offers.some((o) => o.storeName.toLowerCase() === store.toLowerCase() && o.inStock)
    );
  }

  // Búsqueda por texto (nombre, marca o descripción)
  if (typeof q === "string" && q.trim() !== "") {
    const searchTerms = q.toLowerCase().split(" ").filter(Boolean);
    products = products.filter((p) => {
      const targetText = `${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase();
      return searchTerms.every((term) => targetText.includes(term));
    });
  }

  // Ordenamiento
  if (sort === "price_asc") {
    products.sort((a, b) => a.minPrice - b.minPrice);
  } else if (sort === "price_desc") {
    products.sort((a, b) => b.minPrice - a.minPrice);
  } else if (sort === "name_asc") {
    products.sort((a, b) => a.name.localeCompare(b.name));
  }

  res.json(products);
});

// GET /api/products/:id - Detalle de un producto
app.get("/api/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const product = initialProducts.find((p) => p.id === id);

  if (!product) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }

  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

