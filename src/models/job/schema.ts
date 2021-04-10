import mongoose from 'mongoose';
import { JobDocument } from '../../types';

const JobSchema = new mongoose.Schema(
  {
    company: {
      name: String,
      address: String,
      about: String,
    },
    role: String,
    description: String,
    pay: String,
    skills: [String],
    hiring: {
      type: Boolean,
      default: true,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<JobDocument>('Job', JobSchema);
