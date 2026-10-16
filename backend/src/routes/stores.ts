import { Router, type Request, type Response } from "express";
import { withUser } from "../middleware/auth.ts";
import { withAdmin } from "../middleware/roles.ts";
import StoreModel from "../models/Store.ts";
import { badRequest, notFound } from "../utils/errors.ts";
import { pick } from "../utils/pick.ts";

const router = Router();

// GET /api/stores - Listar tiendas (nombres por defecto, objetos completos si ?detailed=true)
router.get("/", async (req: Request, res: Response) => {
  if (req.query.detailed === "true") {
    const stores = await StoreModel.findAll();
    res.json(stores);
    return;
  }
  const names = await StoreModel.findAllNames();
  res.json(names);
});

// GET /api/stores/:id - Obtener tienda por ID
router.get("/:id", async (req: Request, res: Response) => {
  const storeId = Number(req.params.id);
  if (isNaN(storeId)) {
    throw badRequest("ID de tienda inválido");
  }
  const store = await StoreModel.findById(storeId);
  if (!store) {
    throw notFound("Tienda no encontrada");
  }
  res.json(store);
});

// POST /api/stores - Crear tienda (requiere administrador)
router.post("/", withUser, withAdmin, async (req: Request, res: Response) => {
  const { name, slug, websiteUrl, scraperClass, engineType, isActive } = pick(req.body, [
    "name",
    "slug",
    "websiteUrl",
    "scraperClass",
    "engineType",
    "isActive",
  ]);

  if (typeof name !== "string" || !name.trim() || typeof websiteUrl !== "string" || !websiteUrl.trim()) {
    throw badRequest("Los campos name y websiteUrl son obligatorios");
  }

  const created = await StoreModel.create({
    name,
    slug: typeof slug === "string" ? slug : undefined,
    websiteUrl,
    scraperClass: typeof scraperClass === "string" ? scraperClass : undefined,
    engineType: typeof engineType === "string" ? engineType : undefined,
    isActive: typeof isActive === "boolean" ? isActive : undefined,
  });
  res.status(201).json(created);
});

// PUT /api/stores/:id - Actualizar tienda por ID (requiere administrador)
router.put("/:id", withUser, withAdmin, async (req: Request, res: Response) => {
  const storeId = Number(req.params.id);
  if (isNaN(storeId)) {
    throw badRequest("ID de tienda inválido");
  }

  const { name, slug, websiteUrl, scraperClass, engineType, isActive } = pick(req.body, [
    "name",
    "slug",
    "websiteUrl",
    "scraperClass",
    "engineType",
    "isActive",
  ]);

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    throw badRequest("El nombre de la tienda no puede estar vacío");
  }

  const updated = await StoreModel.update(storeId, {
    name: typeof name === "string" ? name : undefined,
    slug: typeof slug === "string" ? slug : undefined,
    websiteUrl: typeof websiteUrl === "string" ? websiteUrl : undefined,
    scraperClass: typeof scraperClass === "string" ? scraperClass : undefined,
    engineType: typeof engineType === "string" ? engineType : undefined,
    isActive: typeof isActive === "boolean" ? isActive : undefined,
  });

  if (!updated) {
    throw notFound("Tienda no encontrada");
  }
  res.json(updated);
});

// DELETE /api/stores/:id - Eliminar tienda por ID (requiere administrador)
router.delete("/:id", withUser, withAdmin, async (req: Request, res: Response) => {
  const storeId = Number(req.params.id);
  if (isNaN(storeId)) {
    throw badRequest("ID de tienda inválido");
  }

  const deleted = await StoreModel.remove(storeId);
  if (!deleted) {
    throw notFound("Tienda no encontrada");
  }
  res.json({ message: "Tienda eliminada correctamente", id: String(storeId) });
});

export default router;
