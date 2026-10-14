import mongoose from "mongoose";
import config from "./config.ts";
import Product from "./models/Product.ts";
import StoreOffer from "./models/StoreOffer.ts";
import { initialProducts } from "./data/productsData.ts";

async function main() {
  await mongoose.connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME });
  console.log("Conectado a MongoDB para seed");

  await Product.deleteMany({});
  await StoreOffer.deleteMany({});

  let productCount = 0;
  let offerCount = 0;
  const usedProductUrls = new Set<string>();

  for (const item of initialProducts) {
    const normalPrices = item.offers.map((offer) => offer.priceNormal);
    const maxPrice = normalPrices.length > 0 ? Math.max(...normalPrices) : item.minPrice;
    const availableStores = [...new Set(item.offers.map((offer) => offer.storeName))];

    const product = await new Product({
      name: item.name,
      slug: item.id,
      brand: item.brand,
      category: item.category,
      section: item.section,
      subCategory: item.subCategory,
      imageUrl: item.imageUrl,
      description: item.description,
      minPrice: item.minPrice,
      maxPrice,
      availableStores,
    }).save();

    productCount += 1;

    for (const offer of item.offers) {
      let productUrl = offer.productUrl;
      if (usedProductUrls.has(productUrl)) {
        productUrl = `${productUrl}#${item.id}`;
      }
      usedProductUrls.add(productUrl);

      await new StoreOffer({
        product: product._id,
        storeName: offer.storeName,
        storeProductId: offer.id,
        productUrl,
        priceCash: offer.priceCash,
        priceNormal: offer.priceNormal,
        inStock: offer.inStock,
        lastScrapedAt: new Date(),
      }).save();
      offerCount += 1;
    }
  }

  console.log(`Seed completo: ${productCount} productos y ${offerCount} ofertas insertadas.`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Error al ejecutar el seed:", error);
  process.exit(1);
});