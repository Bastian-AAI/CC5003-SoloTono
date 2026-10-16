import { Router, type Request, type Response } from "express";
import { withUser } from "../middleware/auth.ts";
import { withAdmin } from "../middleware/roles.ts";
import ProductModel from "../models/Product.ts";
import { badRequest, notFound } from "../utils/errors.ts";
import { pick } from "../utils/pick.ts";

const router = Router();

// GET /api/products/brands - Listado de marcas con productos disponibles
router.get("/brands", async (_req: Request, res: Response) => {
  const brands = await ProductModel.findAllBrands();
  res.json(brands);
});

// GET /api/products - Listar productos con filtros opcionales
router.get("/", async (req: Request, res: Response) => {
  const { category, section, group, brand, store, q, sort, in_stock } = req.query;
  const products = await ProductModel.findAll({
    category: typeof category === "string" ? category : undefined,
    section: typeof section === "string" ? section : undefined,
    group: typeof group === "string" ? group : undefined,
    brand: typeof brand === "string" ? brand : undefined,
    store: typeof store === "string" ? store : undefined,
    q: typeof q === "string" ? q : undefined,
    sort: typeof sort === "string" ? sort : undefined,
    in_stock: typeof in_stock === "string" ? in_stock : undefined,
  });
  res.json(products);
});

// GET /api/products/:id/history - Historial de precios de un producto
router.get("/:id/history", async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) {
    throw badRequest("ID de producto inválido");
  }
  const history = await ProductModel.getHistory(productId);
  res.json(history);
});

// GET /api/products/:id - Obtener producto por ID
router.get("/:id", async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) {
    throw badRequest("ID de producto inválido");
  }
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw notFound("Producto no encontrado");
  }
  res.json(product);
});

// POST /api/products - Crear un nuevo producto canónico (requiere sesión de administrador)
router.post("/", withUser, withAdmin, async (req: Request, res: Response) => {
  const { name, brand, category, description, imageUrl, partNumber } = pick(req.body, [
    "name",
    "brand",
    "category",
    "description",
    "imageUrl",
    "partNumber",
  ]);

  if (typeof name !== "string" || !name.trim() || typeof brand !== "string" || !brand.trim()) {
    throw badRequest("Los campos name y brand son obligatorios");
  }

  const created = await ProductModel.create({
    name,
    brand,
    category: typeof category === "string" ? category : undefined,
    description: typeof description === "string" ? description : undefined,
    imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
    partNumber: typeof partNumber === "string" ? partNumber : undefined,
  });
  res.status(201).json(created);
});

// PUT /api/products/:id - Actualizar producto por ID (requiere sesión de administrador)
router.put("/:id", withUser, withAdmin, async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) {
    throw badRequest("ID de producto inválido");
  }

  const { name, brand, category, description, imageUrl, partNumber } = pick(req.body, [
    "name",
    "brand",
    "category",
    "description",
    "imageUrl",
    "partNumber",
  ]);

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    throw badRequest("El nombre del producto no puede estar vacío");
  }
  if (brand !== undefined && (typeof brand !== "string" || !brand.trim())) {
    throw badRequest("La marca del producto no puede estar vacía");
  }

  const updated = await ProductModel.update(productId, {
    name: typeof name === "string" ? name : undefined,
    brand: typeof brand === "string" ? brand : undefined,
    category: typeof category === "string" ? category : undefined,
    description: typeof description === "string" ? description : undefined,
    imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
    partNumber: typeof partNumber === "string" ? partNumber : undefined,
  });

  if (!updated) {
    throw notFound("Producto no encontrado");
  }
  res.json(updated);
});

// DELETE /api/products/:id - Eliminar producto por ID (requiere sesión de administrador)
router.delete("/:id", withUser, withAdmin, async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) {
    throw badRequest("ID de producto inválido");
  }

  const deleted = await ProductModel.remove(productId);
  if (!deleted) {
    throw notFound("Producto no encontrado");
  }
  res.json({ message: "Producto eliminado correctamente", id: String(productId) });
});

export default router;
