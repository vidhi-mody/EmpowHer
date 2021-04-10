import mongoose from 'mongoose';
import { LikeDocument } from '../../types';

const LikeSchema = new mongoose.Schema(
  {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    onPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<LikeDocument>('Like', LikeSchema);
