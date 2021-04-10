import mongoose from 'mongoose';
import { ChatRoomDocument } from '../../types';

const ChatRoomSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ChatRoomDocument>('Chat Room', ChatRoomSchema);
