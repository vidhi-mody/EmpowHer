import ApplicationModel from './schema';
import { Application, ApplicationDocument } from '../../types';

export const createOne = async (
  data: Application,
): Promise<ApplicationDocument> => {
  try {
    const application = await ApplicationModel.create(data);
    return application;
  } catch (err) {
    throw err;
  }
};

export const findOne = async (filter: any): Promise<ApplicationDocument[]> => {
  try {
    const applications = await ApplicationModel.findOne(filter);
    return applications;
  } catch (err) {
    throw err;
  }
};

export const findAll = async (filter: any): Promise<ApplicationDocument[]> => {
  try {
    const applications = await ApplicationModel.find(filter).populate('by');
    return applications;
  } catch (err) {
    throw err;
  }
};
