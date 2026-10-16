import { Router, type Request, type Response } from "express";
import { withUser } from "../middleware/auth.ts";
import FavoriteModel from "../models/Favorite.ts";
import ProductModel from "../models/Product.ts";
import { badRequest, notFound } from "../utils/errors.ts";
import { pick } from "../utils/pick.ts";

const router = Router();

// Todas las rutas de favoritos están protegidas y requieren sesión activa
router.use(withUser);

// GET /api/favorites - Listar productos favoritos del usuario autenticado
router.get("/", async (req: Request, res: Response) => {
  const favorites = await FavoriteModel.findAllByUser(Number(req.userId));
  res.json(favorites);
});

// GET /api/favorites/:id - Obtener favorito por ID o por productId
router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw badRequest("ID inválido");
  }
  const fav = await FavoriteModel.findById(id, Number(req.userId));
  if (!fav) {
    throw notFound("Favorito no encontrado");
  }
  res.json(fav);
});

// POST /api/favorites - Agregar un producto a favoritos
router.post("/", async (req: Request, res: Response) => {
  const { productId, notes, targetPrice } = pick(req.body, ["productId", "notes", "targetPrice"]);
  const numericProductId = Number(productId);

  if (isNaN(numericProductId) || numericProductId <= 0) {
    throw badRequest("El campo productId es obligatorio y debe ser válido");
  }

  const product = await ProductModel.findById(numericProductId);
  if (!product) {
    throw notFound("El producto especificado no existe");
  }

  const created = await FavoriteModel.create({
    userId: Number(req.userId),
    productId: numericProductId,
    notes: typeof notes === "string" ? notes : undefined,
    targetPrice: targetPrice !== undefined && targetPrice !== null ? Number(targetPrice) : null,
  });
  res.status(201).json(created);
});

// PUT /api/favorites/:id - Actualizar nota o precio objetivo de un favorito
router.put("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw badRequest("ID inválido");
  }

  const { notes, targetPrice } = pick(req.body, ["notes", "targetPrice"]);
  const updated = await FavoriteModel.update(id, Number(req.userId), {
    notes: typeof notes === "string" ? notes : undefined,
    targetPrice: targetPrice !== undefined ? (targetPrice === null ? null : Number(targetPrice)) : undefined,
  });

  if (!updated) {
    throw notFound("Favorito no encontrado");
  }
  res.json(updated);
});

// DELETE /api/favorites/:id - Eliminar producto de favoritos (por ID de favorito o ID de producto)
router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw badRequest("ID inválido");
  }

  const deleted = await FavoriteModel.remove(id, Number(req.userId));
  if (!deleted) {
    throw notFound("Favorito no encontrado");
  }
  res.json({ message: "Eliminado de favoritos", id: String(id) });
});

export default router;
