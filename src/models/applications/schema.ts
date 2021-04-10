import mongoose from 'mongoose';
import { ApplicationDocument } from '../../types';

const ApplicationSchema = new mongoose.Schema(
  {
    for: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['selected', 'rejected', 'under review'],
    },
    responses: [
      {
        question: String,
        answer: String,
        insights: [
          {
            categoryName: String,
            tones: [
              {
                toneName: String,
                score: Number,
              },
            ],
          },
        ],
      },
    ],
    resume: String,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ApplicationDocument>(
  'Application',
  ApplicationSchema,
);
