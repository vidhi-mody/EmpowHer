import { Router, Request, Response, NextFunction } from 'express';
import formidable from 'formidable';
import createError from 'http-errors';
import { UserRepo, MeetRepo } from '../models';
import logger from '../util/logger';
const router = Router();

router.get(
  '/create',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      next(createError(401, 'Please login to view this page'));
    }

    res.render('meet/create', {
      user: req?.session?.user,
    });
  },
);

router.post(
  '/create',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      return next(createError(401, 'Please login to view this page'));
    }

    try {
      const {
        eventName,
        eventDescription,
        eventDate,
        eventTime,
        eventLink,
      } = req.body;

      await MeetRepo.createOne({
        eventName: eventName as string,
        eventDescription: eventDescription as string,
        eventDate: eventDate as string,
        eventTime: eventTime as string,
        eventLink: eventLink as string,
        author: req?.session?.user._id,
      });

      res.status(200).redirect('/meet/view');
    } catch (err) {
      logger.error('Failed to create meet', { err });
      next(createError(500, 'Failed to create meet'));
    }
  },
);

router.post(
  '/delete/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      return next(createError(401, 'Please login to view this page'));
    }

    try {
      await MeetRepo.deleteOne(req.params.id, req.session.user._id);
      res.status(200).send({
        message: 'Deleted',
      });
    } catch (err) {
      logger.error('Error deleting meet', { err });
      next(createError(500, 'Error deleting meet'));
    }
  },
);

/* GET Meets Page */
router.get('/view', async (req: Request, res: Response, next: NextFunction) => {
  if (req?.session?.user) {
    const user = await UserRepo.findOne({
      username: req.session.user.username,
    });

    const meets = await MeetRepo.findAll();

    res.render('meet/view', {
      user,
      meets,
    });
  } else {
    next(createError(401, 'Please login to view this page'));
  }
});

export default router;
