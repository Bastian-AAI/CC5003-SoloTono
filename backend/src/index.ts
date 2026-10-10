import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initialProducts, type Product } from "./data/productsData.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
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
  const { category, section, store, q, sort } = req.query;

  // Filtrado por sección (Instrumentos, Piezas y Repuestos, Equipos de sonido)
  if (typeof section === "string" && section.trim() !== "" && section !== "Todas") {
    products = products.filter(
      (p) => p.section?.toLowerCase() === section.toLowerCase()
    );
  }

  // Filtrado por categoría o subcategoría (ej: Cuerda, Aire, Percusión, etc.)
  if (typeof category === "string" && category.trim() !== "" && category !== "Todas") {
    const catLower = category.toLowerCase();
    products = products.filter(
      (p) =>
        p.category.toLowerCase() === catLower ||
        p.subCategory?.toLowerCase() === catLower
    );
  }

  // Filtrado por tienda disponible
  if (typeof store === "string" && store.trim() !== "" && store !== "Todas") {
    products = products.filter((p) =>
      p.offers.some((o) => o.storeName.toLowerCase() === store.toLowerCase() && o.inStock)
    );
  }

  // Búsqueda por texto (nombre, marca, categoría, subcategoría, sección o descripción)
  if (typeof q === "string" && q.trim() !== "") {
    const searchTerms = q.toLowerCase().split(" ").filter(Boolean);
    products = products.filter((p) => {
      const targetText = `${p.name} ${p.brand} ${p.category} ${p.subCategory || ""} ${p.section || ""} ${p.description}`.toLowerCase();
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

// Simulación de una base de datos o almacenamiento en memoria de usuarios para pruebas
const users: any[] = [];

// POST /api/auth/register - Registro de usuario
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { username, name, password } = req.body;
  
  if (!username || !password) {
    res.status(400).json({ error: "Faltan datos obligatorios (username, password)" });
    return;
  }

  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    res.status(409).json({ error: "El nombre de usuario ya está en uso" });
    return;
  }

  const newUser = { id: String(Date.now()), username, name: name || username, password };
  users.push(newUser);

  // Enviamos un token CSRF de ejemplo en los headers si tu frontend lo espera
  res.setHeader('x-csrf-token', 'mock-csrf-token-12345');
  res.status(201).json({ id: newUser.id, username: newUser.username, name: newUser.name });
});

// POST /api/auth/login - Inicio de sesión
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    return;
  }

  res.setHeader('x-csrf-token', 'mock-csrf-token-12345');
  res.json({ id: user.id, username: user.username, name: user.name });
});

// GET /api/auth/me - Restaurar sesión actual
app.get("/api/auth/me", (req: Request, res: Response) => {
  // Aquí puedes validar cookies o sesiones reales. 
  // Para pruebas, si hay usuarios registrados, devolvemos el último o un error 401 si no hay sesión.
  if (users.length === 0) {
    res.status(401).json({ error: "No hay sesión activa" });
    return;
  }
  // Devolvemos un usuario por defecto para mantener la sesión activa temporalmente
  res.json({ id: users[0].id, username: users[0].username, name: users[0].name });
});

// POST /api/auth/logout - Cerrar sesión
app.post("/api/auth/logout", (_req: Request, res: Response) => {
  res.json({ message: "Sesión cerrada exitosamente" });
});
