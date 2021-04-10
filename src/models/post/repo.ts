import { promises as fs } from 'fs';
import path from 'path';
import PostModel from './schema';
import { Post, PostDocument, UserDocument } from '../../types';

export const createOne = async (data: Post): Promise<PostDocument> => {
  try {
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
