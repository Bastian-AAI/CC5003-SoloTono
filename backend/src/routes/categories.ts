import { Router, type Request, type Response } from "express";
import { withUser } from "../middleware/auth.ts";
import { withAdmin } from "../middleware/roles.ts";
import CategoryModel from "../models/Category.ts";
import { badRequest, notFound } from "../utils/errors.ts";
import { pick } from "../utils/pick.ts";

const router = Router();

// GET /api/categories - Listar categorías (nombres por defecto, objetos completos si ?detailed=true)
router.get("/", async (req: Request, res: Response) => {
  if (req.query.detailed === "true") {
    const categories = await CategoryModel.findAll();
    res.json(categories);
    return;
  }
  const names = await CategoryModel.findAllNames();
  res.json(names);
});

// GET /api/categories/tree - Estructura jerárquica de secciones, grupos y categorías
router.get("/tree", async (_req: Request, res: Response) => {
  const tree = await CategoryModel.getTaxonomyTree();
  res.json(tree);
});

// GET /api/categories/:id - Obtener categoría por ID
router.get("/:id", async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);
  if (isNaN(categoryId)) {
    throw badRequest("ID de categoría inválido");
  }
  const category = await CategoryModel.findById(categoryId);
  if (!category) {
    throw notFound("Categoría no encontrada");
  }
  res.json(category);
});

// POST /api/categories - Crear categoría (requiere administrador)
router.post("/", withUser, withAdmin, async (req: Request, res: Response) => {
  const { name, slug, groupId, ordering } = pick(req.body, ["name", "slug", "groupId", "ordering"]);

  if (typeof name !== "string" || !name.trim()) {
    throw badRequest("El campo name es obligatorio");
  }

  const created = await CategoryModel.create({
    name,
    slug: typeof slug === "string" ? slug : undefined,
    groupId: typeof groupId === "number" ? groupId : null,
    ordering: typeof ordering === "number" ? ordering : 0,
  });
  res.status(201).json(created);
});

// PUT /api/categories/:id - Actualizar categoría por ID (requiere administrador)
router.put("/:id", withUser, withAdmin, async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);
  if (isNaN(categoryId)) {
    throw badRequest("ID de categoría inválido");
  }

  const { name, slug, groupId, ordering } = pick(req.body, ["name", "slug", "groupId", "ordering"]);

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    throw badRequest("El nombre de la categoría no puede estar vacío");
  }

  const updated = await CategoryModel.update(categoryId, {
    name: typeof name === "string" ? name : undefined,
    slug: typeof slug === "string" ? slug : undefined,
    groupId: typeof groupId === "number" || groupId === null ? groupId : undefined,
    ordering: typeof ordering === "number" ? ordering : undefined,
  });

  if (!updated) {
    throw notFound("Categoría no encontrada");
  }
  res.json(updated);
});

// DELETE /api/categories/:id - Eliminar categoría por ID (requiere administrador)
router.delete("/:id", withUser, withAdmin, async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);
  if (isNaN(categoryId)) {
    throw badRequest("ID de categoría inválido");
  }

  const deleted = await CategoryModel.remove(categoryId);
  if (!deleted) {
    throw notFound("Categoría no encontrada");
  }
  res.json({ message: "Categoría eliminada correctamente", id: String(categoryId) });
});

export default router;
