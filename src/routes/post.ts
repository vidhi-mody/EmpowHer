import { Router, Request, Response, NextFunction } from 'express';
import formidable from 'formidable';
import createError from 'http-errors';
import mv from 'mv';
import { nanoid } from 'nanoid';
import path from 'path';
import * as PostRepo from '../models/post/repo';
import logger from '../util/logger';
const router = Router();

router.get('/new', async (req: Request, res: Response, next: NextFunction) => {
  if (!req?.session?.user) {
    next(createError(401, 'Please login to view this page'));
  }

  res.render('post/new', {
    user: req.user,
  });
});

router.post('/new', async (req: Request, res: Response, next: NextFunction) => {
  if (!req?.session?.user) {
    return next(createError(401, 'Please login to view this page'));
  }

  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        throw err;
      }
      const { caption, category } = fields;
      let fileName: string | undefined, type: string | undefined;

      if (files) {
        const { type: fileType, path: filePath } = !Array.isArray(files.file)
          ? files.file
          : files.file[0];

        if (
          fileType &&
          ['jpeg', 'jpg', 'png', 'gif'].indexOf(fileType.split('/')[1]) === -1
        ) {
          throw new Error('Unsupported file format');
        }

        fileName = fileType ? `${nanoid()}.${fileType.split('/')[1]}` : ``;

        const staticPath = path.resolve(
          path.join(process.cwd(), 'src', 'public', 'uploads', fileName),
        );
        type = fileType || ``;

        mv(filePath, staticPath, { mkdirp: true }, (err) => {
          if (err) {
            throw err;
          }
        });
      }

      await PostRepo.createOne({
        author: req?.session?.user._id,
        caption: caption as string,
        category: category as string,
        staticUrl: `/uploads/${fileName}`,
        type,
      });

      res.status(200).redirect('/');
    });
  } catch (err) {
    logger.error('Failed to create post', { err });
    next(createError(500, 'Failed to create post'));
  }
});

router.post(
  '/delete/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      return next(createError(401, 'Please login to view this page'));
    }

    try {
      await PostRepo.deleteOne(req.params.id, req.session.user._id);
      res.status(200).send({
        message: 'Deleted',
      });
    } catch (err) {
      logger.error('Error deleting post', { err });
      next(createError(500, 'Error deleting post'));
    }
  },
);

export default router;
