import mongoose from 'mongoose';
import { MessageDocument } from '../../types';

const MessageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<MessageDocument>('Message', MessageSchema);
