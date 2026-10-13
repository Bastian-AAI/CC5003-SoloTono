import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  publication: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    publication: { type: Schema.Types.ObjectId, ref: 'Publication', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IComment>('Comment', CommentSchema);