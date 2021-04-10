import { Router, Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { ChatRoomRepo, UserRepo } from '../models';
import logger from '../util/logger';
const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  if (!req?.session?.user) {
    return next(createError(401, 'You need to be logged in to view this page'));
  }

  try {
    const users = await UserRepo.findAll();

    return res.render('chat/index', {
      user: req.session.user,
      users,
    });
  } catch (err) {
    logger.error('Error fetching messages', { err });
    next(createError(500, 'Failed to fetch messages'));
  }
});

router.get(
  '/:username',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      return next(
        createError(401, 'You need to be logged in to view this page'),
      );
    } else if (req.session.user.username === req.params.username) {
      return next(createError(403, 'Cannot chat with yourself'));
    }

    try {
      const receiver = await UserRepo.findOne({
        username: req.params.username,
      });

      if (!receiver) {
        return next(
          createError(403, 'User you are trying to chat with does not exist'),
        );
      }

      const room = await ChatRoomRepo.findOrCreateOne([
        req.session.user._id,
        receiver._id,
      ]);

      req.session.socket = {
        room: room._id,
      };

      res.render('chat/room', {
        user: req.session.user,
        receiver,
        room,
      });
    } catch (err) {
      logger.error('Error establishing chat', { err });
      next(createError(500, 'Error establishing chat'));
    }
  },
);

export default router;
