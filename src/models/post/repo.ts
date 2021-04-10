import Filter from 'bad-words';
import { promises as fs } from 'fs';
import path from 'path';
import PostModel from './schema';
import { Post, PostDocument, UserDocument } from '../../types';

const filter = new Filter({ placeHolder: 'x' });

export const createOne = async (data: Post): Promise<PostDocument> => {
  try {
    if (data?.caption && filter.isProfane(data.caption)) {
      data.caption = filter.clean(data.caption);
      data.isHateSpeech = true;
    }

    const post = await PostModel.create(data);
    return post;
  } catch (err) {
    throw err;
  }
};

export const deleteOne = async (
  postId: PostDocument['_id'],
  authorId: UserDocument['_id'],
): Promise<void> => {
  try {
    const post = await PostModel.findOneAndDelete({
      _id: postId,
      author: authorId,
    });

    if (post && post.staticUrl) {
      const filePath = path.resolve(
        path.join(process.cwd(), 'src', 'public', post.staticUrl),
      );
      await fs.unlink(filePath);
    }
  } catch (err) {
    throw err;
  }
};

export const findAll = async (filter?: any): Promise<PostDocument[]> => {
  try {
    const posts = await PostModel.find({ ...filter }, null, {
      sort: { createdAt: -1 },
    }).populate('author');
    return posts;
  } catch (err) {
    throw err;
  }
};
