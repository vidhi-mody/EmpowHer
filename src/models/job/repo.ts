import JobModel from './schema';
import { Job, JobDocument } from '../../types';

export const createOne = async (data: Job): Promise<JobDocument> => {
  try {
    const job = await JobModel.create(data);
    return job;
  } catch (err) {
    throw err;
  }
};

export const findAll = async (filter: any): Promise<JobDocument[]> => {
  try {
    const jobs = await JobModel.find(filter);
    return jobs;
  } catch (err) {
    throw err;
  }
};

export const findOne = async (filter?: any): Promise<JobDocument | null> => {
  try {
    const job = await JobModel.findOne(filter).populate('applications');
    return job;
  } catch (err) {
    throw err;
  }
};

export const update = async (
  jobId: string,
  update: any,
): Promise<JobDocument | null> => {
  try {
    const job = await JobModel.findByIdAndUpdate(jobId, update);
    return job;
  } catch (err) {
    throw err;
  }
};
