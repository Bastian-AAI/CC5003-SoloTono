import { Router, type Request, type Response } from "express";
import { withUser } from "../middleware/auth.ts";
import { withAdmin } from "../middleware/roles.ts";
import OfferModel from "../models/Offer.ts";
import { badRequest, notFound } from "../utils/errors.ts";
import { pick } from "../utils/pick.ts";

const router = Router();

// GET /api/offers - Listar ofertas (con filtro opcional ?productId=...)
router.get("/", async (req: Request, res: Response) => {
  const productIdParam = req.query.productId ?? req.query.product_id;
  const productId = typeof productIdParam === "string" ? Number(productIdParam) : undefined;
  const offers = await OfferModel.findAll(productId);
  res.json(offers);
});

// GET /api/offers/:id - Obtener oferta por ID
router.get("/:id", async (req: Request, res: Response) => {
  const offerId = Number(req.params.id);
  if (isNaN(offerId)) {
    throw badRequest("ID de oferta inválido");
  }
  const offer = await OfferModel.findById(offerId);
  if (!offer) {
    throw notFound("Oferta no encontrada");
  }
  res.json(offer);
});

// POST /api/offers - Crear oferta y registro en historial (requiere administrador)
router.post("/", withUser, withAdmin, async (req: Request, res: Response) => {
  const { storeId, productId, name, url, sku, priceCash, priceNormal, inStock } = pick(req.body, [
    "storeId",
    "productId",
    "name",
    "url",
    "sku",
    "priceCash",
    "priceNormal",
    "inStock",
  ]);

  const numericStoreId = Number(storeId);
  const numericCash = Number(priceCash);
  const numericNormal = Number(priceNormal ?? priceCash);

  if (
    isNaN(numericStoreId) ||
    typeof name !== "string" ||
    !name.trim() ||
    typeof url !== "string" ||
    !url.trim() ||
    isNaN(numericCash) ||
    numericCash < 0
  ) {
    throw badRequest("Faltan campos obligatorios o son inválidos (storeId, name, url, priceCash)");
  }

  const created = await OfferModel.create({
    storeId: numericStoreId,
    productId: productId ? Number(productId) : null,
    name,
    url,
    sku: typeof sku === "string" ? sku : undefined,
    priceCash: numericCash,
    priceNormal: isNaN(numericNormal) ? numericCash : numericNormal,
    inStock: typeof inStock === "boolean" ? inStock : true,
  });
  res.status(201).json(created);
});

// PUT /api/offers/:id - Actualizar oferta y registrar precio en historial (requiere administrador)
router.put("/:id", withUser, withAdmin, async (req: Request, res: Response) => {
  const offerId = Number(req.params.id);
  if (isNaN(offerId)) {
    throw badRequest("ID de oferta inválido");
  }

  const { productId, name, url, sku, priceCash, priceNormal, inStock, isActive } = pick(req.body, [
    "productId",
    "name",
    "url",
    "sku",
    "priceCash",
    "priceNormal",
    "inStock",
    "isActive",
  ]);

  if (priceCash !== undefined && (isNaN(Number(priceCash)) || Number(priceCash) < 0)) {
    throw badRequest("El precio efectivo debe ser un número válido");
  }

  const updated = await OfferModel.update(offerId, {
    productId: productId !== undefined ? (productId === null ? null : Number(productId)) : undefined,
    name: typeof name === "string" ? name : undefined,
    url: typeof url === "string" ? url : undefined,
    sku: typeof sku === "string" ? sku : undefined,
    priceCash: priceCash !== undefined ? Number(priceCash) : undefined,
    priceNormal: priceNormal !== undefined ? Number(priceNormal) : undefined,
    inStock: typeof inStock === "boolean" ? inStock : undefined,
    isActive: typeof isActive === "boolean" ? isActive : undefined,
  });

  if (!updated) {
    throw notFound("Oferta no encontrada");
  }
  res.json(updated);
});

// DELETE /api/offers/:id - Eliminar oferta por ID (requiere administrador)
router.delete("/:id", withUser, withAdmin, async (req: Request, res: Response) => {
  const offerId = Number(req.params.id);
  if (isNaN(offerId)) {
    throw badRequest("ID de oferta inválido");
  }

  const deleted = await OfferModel.remove(offerId);
  if (!deleted) {
    throw notFound("Oferta no encontrada");
  }
  res.json({ message: "Oferta eliminada correctamente", id: String(offerId) });
});

export default router;
