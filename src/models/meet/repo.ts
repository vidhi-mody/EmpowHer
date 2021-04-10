import MeetModel from './schema';
import { Meet, MeetDocument, UserDocument } from '../../types';

export const createOne = async (data: Meet): Promise<MeetDocument> => {
  try {
    const meet = await MeetModel.create(data);
    return meet;
  } catch (err) {
    throw err;
  }
};

export const deleteOne = async (
  meetId: MeetDocument['_id'],
  authorId: UserDocument['_id'],
): Promise<void> => {
  try {
    const post = await MeetModel.findOneAndDelete({
      _id: meetId,
      author: authorId,
    });
  } catch (err) {
    throw err;
  }
};

export const findAll = async (): Promise<MeetDocument[]> => {
  try {
    const meets = await MeetModel.find({}, null, {
      sort: { createdAt: -1 },
    }).populate('author');
    return meets;
  } catch (err) {
    throw err;
  }
};
