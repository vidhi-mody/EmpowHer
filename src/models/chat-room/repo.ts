import ChatRoomModel from './schema';
import { ChatRoomDocument, UserDocument } from '../../types';

export const updateOne = async (
  id: string,
  data: any,
): Promise<ChatRoomDocument | null> => {
  try {
    const room = await ChatRoomModel.findOneAndUpdate(data, { new: true });
    return room;
  } catch (err) {
    throw err;
  }
};

export const findByIdAndPopulate = async (
  id: string,
): Promise<ChatRoomDocument | null> => {
  try {
    const room = await ChatRoomModel.findById(id).populate('messages');
    return room;
  } catch (err) {
    throw err;
  }
};

export const findManyAndPopulate = async (
  filter: any,
): Promise<ChatRoomDocument[]> => {
  try {
    const rooms = await ChatRoomModel.find(filter).populate({
      path: 'messages',
      populate: {
        path: 'by',
      },
    });
    return rooms;
  } catch (err) {
    throw err;
  }
};

export const findOrCreateOne = async (
  users: UserDocument['_id'][],
): Promise<ChatRoomDocument> => {
  try {
    let room = await ChatRoomModel.findOne({
      users: {
        $in: users,
      },
    }).populate({
      path: 'messages',
      populate: {
        path: 'by',
      },
    });

    if (!room) {
      room = await ChatRoomModel.create({
        users,
      });
    }

    return room;
  } catch (err) {
    throw err;
  }
};
