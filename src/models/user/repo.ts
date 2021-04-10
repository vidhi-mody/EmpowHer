import UserModel from './schema';
import { User as UserInterface, UserDocument } from '../../types';
import logger from '../../util/logger';

interface User {
  username?: UserInterface['username'];
  email?: UserInterface['email'];
}

export const findOne = async (filter: User): Promise<null | UserDocument> => {
  try {
    const user = await UserModel.findOne(filter);

    return user;
  } catch (err) {
    logger.error('Error fetching user from the Database', { err });
    throw err;
  }
};

export const createOne = async (data: UserInterface): Promise<UserDocument> => {
  try {
    const user = await UserModel.create(data);

    return user;
  } catch (err) {
    throw err;
  }
};

export const findAll = async (): Promise<UserDocument[]> => {
  try {
    const users = await UserModel.find();
    return users;
  } catch (err) {
    throw err;
  }
};
