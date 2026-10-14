import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import config from "../config.ts";
import Product from "../models/Product.ts";
import StoreOffer from "../models/StoreOffer.ts";
import PriceHistory from "../models/PriceHistory.ts";
import { HttpError } from "../utils/errors.ts";
import { badRequest, unauthorized } from "../utils/errors.ts";

const router = Router();

const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

const requireConfigured = (): void => {
  if (config.SCRAPER_API_KEY === "") {
    throw new HttpError(503, "El endpoint de scraper no está configurado (SCRAPER_API_KEY ausente)");
  }
};

const asObject = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : null;

const stripHtml = (value: unknown): string | undefined => {
  const text = asString(value);
  if (!text) return undefined;
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || undefined;
};

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const parseDate = (value: unknown): Date | null => {
  if (value === undefined || value === null || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

interface NormalizedItem {
  productSlug: string | null;
  product: Record<string, unknown> | null;
  offer: Record<string, unknown>;
}

const normalizeBody = (body: unknown): NormalizedItem[] => {
  const items: NormalizedItem[] = [];

  const pushOffer = (offer: Record<string, unknown>, product: Record<string, unknown> | null, slug: string | null): void => {
    items.push({ productSlug: slug, product, offer });
  };

  if (Array.isArray(body)) {
    for (const raw of body) {
      const obj = asObject(raw);
      if (obj) pushOffer(obj, asObject(obj.product), asString(obj.productSlug) ?? asString(obj.slug));
    }
    return items;
  }

  const root = asObject(body);
  if (!root) return items;

  if (Array.isArray(root.items)) {
    for (const raw of root.items) {
      const obj = asObject(raw);
      if (!obj) continue;
      pushOffer(
        asObject(obj.offer) ?? obj,
        asObject(obj.product),
        asString(obj.productSlug) ?? asString(obj.slug),
      );
    }
  } else if (Array.isArray(root.offers)) {
    for (const raw of root.offers) {
      const obj = asObject(raw);
      if (!obj) continue;
      pushOffer(obj, asObject(obj.product), asString(obj.productSlug) ?? asString(obj.slug));
    }
  }

  return items;
};

const recalculateProduct = async (productId: unknown): Promise<void> => {
  const offers = await StoreOffer.find({ product: productId }).lean();
  const cashPrices = offers.map((offer) => offer.priceCash);
  const normalPrices = offers.map((offer) => offer.priceNormal);
  const minPrice = cashPrices.length > 0 ? Math.min(...cashPrices) : 0;
  const maxPrice = normalPrices.length > 0 ? Math.max(...normalPrices) : 0;
  const availableStores = [...new Set(offers.map((offer) => offer.storeName))];

  await Product.findByIdAndUpdate(productId, {
    minPrice,
    maxPrice,
    availableStores,
  });
};

router.post("/sync", async (req: Request, res: Response, next: NextFunction) => {
  try {
    requireConfigured();

    const apiKey = req.headers["x-api-key"];
    if (typeof apiKey !== "string" || !safeEqual(apiKey, config.SCRAPER_API_KEY)) {
      throw unauthorized("invalid scraper api key");
    }

    const items = normalizeBody(req.body);
    if (items.length === 0) {
      throw badRequest("body must contain at least one offer");
    }

    const summary = {
      processed: 0,
      createdProducts: 0,
      createdOffers: 0,
      updatedOffers: 0,
      priceHistoryEntries: 0,
      errors: [] as Array<{ index: number; message: string }>,
    };

    for (const [index, item] of items.entries()) {
      try {
        const offerRaw = item.offer;
        const storeName = asString(offerRaw.storeName);
        const productUrl = asString(offerRaw.productUrl);
        const priceCash = asNumber(offerRaw.priceCash);
        const priceNormal = asNumber(offerRaw.priceNormal);

        if (!storeName) throw new Error("offer.storeName is required");
        if (!productUrl) throw new Error("offer.productUrl is required");
        if (priceCash === null) throw new Error("offer.priceCash must be a number");
        if (priceNormal === null) throw new Error("offer.priceNormal must be a number");

        const slugFromPayload = asString(item.productSlug) ?? asString(item.product?.slug);
        const productPayload = item.product;
        const slug = slugFromPayload ?? asString(productPayload?.slug);
        if (!slug) throw new Error("product slug is required");

        let product = await Product.findOne({ slug });
        if (!product) {
          if (!productPayload) {
            throw new Error(`product '${slug}' does not exist`);
          }
          product = await new Product({
            name: asString(productPayload.name) ?? slug,
            slug,
            brand: asString(productPayload.brand) ?? "Sin marca",
            category: asString(productPayload.category) ?? "Otros",
            section: asString(productPayload.section) ?? undefined,
            subCategory: asString(productPayload.subCategory) ?? undefined,
            imageUrl: asString(productPayload.imageUrl) ?? "/placeholder-instrument.svg",
            description: stripHtml(productPayload.description),
            minPrice: priceCash,
            maxPrice: priceNormal,
            availableStores: [storeName],
          }).save();
          summary.createdProducts += 1;
        } else if (productPayload) {
          if (asString(productPayload.name)) product.name = asString(productPayload.name) as string;
          if (asString(productPayload.brand)) product.brand = asString(productPayload.brand) as string;
          if (asString(productPayload.category)) product.category = asString(productPayload.category) as string;
          if (asString(productPayload.section)) product.section = asString(productPayload.section) as string;
          if (asString(productPayload.subCategory)) product.subCategory = asString(productPayload.subCategory) as string;
          if (asString(productPayload.imageUrl)) product.imageUrl = asString(productPayload.imageUrl) as string;
          const cleanedDescription = stripHtml(productPayload.description);
          if (cleanedDescription) product.description = cleanedDescription;          await product.save();
        }

        const inStock = typeof offerRaw.inStock === "boolean" ? offerRaw.inStock : true;
        const storeProductId = asString(offerRaw.storeProductId) ?? undefined;
        const sku = asString(offerRaw.sku) ?? undefined;
        const scrapedAt = parseDate(offerRaw.scrapedAt);

        let offer = await StoreOffer.findOne({ product: product._id, storeName });
        if (!offer) {
          offer = await StoreOffer.findOne({ productUrl });
        }

        const previousPriceCash = offer?.priceCash;
        const previousPriceNormal = offer?.priceNormal;
        const hasPrevious = offer !== null;

        if (offer) {
          offer.storeName = storeName;
          offer.storeProductId = storeProductId;
          offer.sku = sku;
          offer.productUrl = productUrl;
          offer.priceCash = priceCash;
          offer.priceNormal = priceNormal;
          offer.inStock = inStock;
          offer.lastScrapedAt = scrapedAt ?? new Date();
          await offer.save();
          summary.updatedOffers += 1;
        } else {
          offer = await new StoreOffer({
            product: product._id,
            storeName,
            storeProductId,
            sku,
            productUrl,
            priceCash,
            priceNormal,
            inStock,
            lastScrapedAt: scrapedAt ?? new Date(),
          }).save();
          summary.createdOffers += 1;
        }

        const priceChanged =
          !hasPrevious ||
          previousPriceCash !== priceCash ||
          previousPriceNormal !== priceNormal;

        if (priceChanged) {
          await new PriceHistory({
            offer: offer._id,
            product: product._id,
            priceCash,
            priceNormal,
            date: scrapedAt ?? new Date(),
          }).save();
          summary.priceHistoryEntries += 1;
        }

        await recalculateProduct(product._id);
        summary.processed += 1;
      } catch (error) {
        summary.errors.push({
          index,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
});

export default router;