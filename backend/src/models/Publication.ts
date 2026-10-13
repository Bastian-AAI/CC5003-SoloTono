import mongoose, { Schema, Document } from 'mongoose';

export interface IPublication extends Document {
  user: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
}

const PublicationSchema = new Schema<IPublication>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPublication>('Publication', PublicationSchema);