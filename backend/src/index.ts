import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import config from "./config.ts";
import authRouter from "./routes/auth.ts";
import scraperRouter from "./routes/scraper.ts";
import Product from "./models/Product.ts";
import StoreOffer from "./models/StoreOffer.ts";
import { unknownEndpoint, errorHandler } from "./middleware/errorHandler.ts";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["X-CSRF-Token"],
  }),
);app.use(express.json());
app.use(cookieParser());

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "CC5003-SoloTono API is up and running!",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/internal/scraper", scraperRouter);

app.get("/api/categories", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

app.get("/api/stores", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const storeNames = await StoreOffer.distinct("storeName");
    res.json(storeNames);
  } catch (error) {
    next(error);
  }
});

type ApiStoreOffer = {
  id: string;
  storeName: string;
  priceCash: number;
  priceNormal: number;
  inStock: boolean;
  productUrl: string;
};

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  section?: string;
  subCategory?: string;
  imageUrl: string;
  description?: string;
  minPrice: number;
  maxPrice?: number;
  offers: ApiStoreOffer[];
};

app.get("/api/products", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, section, store, q, sort } = req.query;

    const productDocs = await Product.find().lean();
    const productIds = productDocs.map((product) => product._id);
    const offerDocs = await StoreOffer.find({ product: { $in: productIds } }).lean();

    const offersByProduct = new Map<string, ApiStoreOffer[]>();
    for (const offer of offerDocs) {
      if (!offer.product) continue;
      const key = String(offer.product);
      const list = offersByProduct.get(key) ?? [];
      list.push({
        id: String(offer._id),
        storeName: offer.storeName,
        priceCash: offer.priceCash,
        priceNormal: offer.priceNormal,
        inStock: offer.inStock,
        productUrl: offer.productUrl,
      });
      offersByProduct.set(key, list);
    }

    let products: ApiProduct[] = productDocs.map((product) => ({
      id: String(product._id),
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      category: product.category,
      section: product.section,
      subCategory: product.subCategory,
      imageUrl: product.imageUrl,
      minPrice: product.minPrice ?? 0,
      maxPrice: product.maxPrice,
      offers: offersByProduct.get(String(product._id)) ?? [],
    }));

    if (typeof section === "string" && section.trim() !== "" && section !== "Todas") {
      products = products.filter((product) => product.section?.toLowerCase() === section.toLowerCase());
    }
    if (typeof category === "string" && category.trim() !== "" && category !== "Todas") {
      const catLower = category.toLowerCase();
      products = products.filter(
        (product) =>
          product.category.toLowerCase() === catLower || product.subCategory?.toLowerCase() === catLower,
      );
    }
    if (typeof store === "string" && store.trim() !== "" && store !== "Todas") {
      products = products.filter((product) =>
        product.offers.some((offer) => offer.storeName.toLowerCase() === store.toLowerCase() && offer.inStock),
      );
    }
    if (typeof q === "string" && q.trim() !== "") {
      const searchTerms = q.toLowerCase().split(" ").filter(Boolean);
      products = products.filter((product) => {
        const targetText = `${product.name} ${product.brand} ${product.category} ${product.subCategory || ""} ${product.section || ""} ${product.description || ""}`.toLowerCase();
        return searchTerms.every((term) => targetText.includes(term));
      });
    }

    if (sort === "price_asc") products.sort((a, b) => a.minPrice - b.minPrice);
    else if (sort === "price_desc") products.sort((a, b) => b.minPrice - a.minPrice);
    else if (sort === "name_asc") products.sort((a, b) => a.name.localeCompare(b.name));

    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    const offerDocs = await StoreOffer.find({ product: product._id }).lean();
    const offers: ApiStoreOffer[] = offerDocs.map((offer) => ({
      id: String(offer._id),
      storeName: offer.storeName,
      priceCash: offer.priceCash,
      priceNormal: offer.priceNormal,
      inStock: offer.inStock,
      productUrl: offer.productUrl,
    }));

    const response: ApiProduct = {
      id: String(product._id),
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      category: product.category,
      section: product.section,
      subCategory: product.subCategory,
      imageUrl: product.imageUrl,
      description: product.description,
      minPrice: product.minPrice ?? 0,
      maxPrice: product.maxPrice,
      offers,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.use(unknownEndpoint);
app.use(errorHandler);

async function start() {
  mongoose.set("strictQuery", false);
  await mongoose.connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME });
  console.log("Conectado exitosamente a MongoDB");
  app.listen(config.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${config.PORT}`);
  });
}

start().catch((error) => {
  console.error("Error al iniciar el servidor:", error);
  process.exit(1);
});