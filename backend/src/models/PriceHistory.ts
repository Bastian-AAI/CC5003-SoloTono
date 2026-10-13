// backend/src/models/PriceHistory.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceHistory extends Document {
  offer: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  priceCash: number;
  priceNormal: number;
  date: Date;
}

const PriceHistorySchema = new Schema<IPriceHistory>({
  offer: { type: Schema.Types.ObjectId, ref: 'StoreOffer', required: true, index: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', index: true },
  priceCash: { type: Number, required: true },
  priceNormal: { type: Number, required: true },
  date: { type: Date, default: Date.now, index: true },
});

export default mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema);