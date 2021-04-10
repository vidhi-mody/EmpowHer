import MessageModel from './schema';
import { Message, MessageDocument } from '../../types';

export const createOne = async (data: Message): Promise<MessageDocument> => {
  try {
    const message = await MessageModel.create(data);
    return message;
  } catch (err) {
    throw err;
  }
};
