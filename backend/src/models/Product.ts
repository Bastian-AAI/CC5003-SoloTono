// backend/src/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';
import { schemaOptions } from "./shared.ts";

export interface IProduct extends Document {
  name: string;
  slug: string;
  brand: string;
  category: string;
  section?: string;
  subCategory?: string;
  imageUrl: string;
  description?: string;
  specs?: Map<string, string>;
  minPrice?: number;
  maxPrice?: number;
  availableStores: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    section: { type: String },
    subCategory: { type: String },
    imageUrl: { type: String, required: true },
    description: { type: String },
    specs: { type: Map, of: String },
    minPrice: { type: Number, default: 0, index: true },
    maxPrice: { type: Number, default: 0 },
    availableStores: [{ type: String }],
  },
  schemaOptions
);

export default mongoose.model<IProduct>('Product', ProductSchema);