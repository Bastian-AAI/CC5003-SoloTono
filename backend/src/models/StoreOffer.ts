// backend/src/models/StoreOffer.ts
import mongoose, { Schema, Document } from 'mongoose';
import { schemaOptions } from "./shared.ts";

export interface IStoreOffer extends Document {
  product?: mongoose.Types.ObjectId; // Opcional hasta que sea homologado
  storeName: string;                  // 'Casa Amarilla' | 'Audiomusica' | etc.
  storeProductId?: string;
  sku?: string;
  productUrl: string;
  priceCash: number;                  // Transferencia / Efectivo
  priceNormal: number;                // Tarjeta / Cuotas
  inStock: boolean;
  lastScrapedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StoreOfferSchema = new Schema<IStoreOffer>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', default: null, index: true },
    storeName: { type: String, required: true, index: true },
    storeProductId: { type: String },
    sku: { type: String },
    productUrl: { type: String, required: true, unique: true, index: true },
    priceCash: { type: Number, required: true },
    priceNormal: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
    lastScrapedAt: { type: Date, default: Date.now },
  },
  schemaOptions
);

export default mongoose.model<IStoreOffer>('StoreOffer', StoreOfferSchema);