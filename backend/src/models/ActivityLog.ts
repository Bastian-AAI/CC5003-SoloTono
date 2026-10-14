import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  actionType: 'VIEW' | 'CLICK_OFFER' | 'FAVORITE' | 'COMMENT';
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  actionType: { type: String, enum: ['VIEW', 'CLICK_OFFER', 'FAVORITE', 'COMMENT'], required: true },
  createdAt: { type: Date, default: Date.now, expires: '90d' }, // Borrado automático a los 90 días
});

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);