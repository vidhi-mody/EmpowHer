import mongoose from 'mongoose';
import { MeetDocument } from '../../types';

const MeetSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },
    eventDescription: String,
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
    },
    eventLink: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<MeetDocument>('Meet', MeetSchema);
