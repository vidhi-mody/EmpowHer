import { Router, Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
const router = Router();

/* GET bot page. */
router.get(
  '/chatbot',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      return next(
        createError(401, 'You need to be logged in to view this page!'),
      );
    }

    res.render('bot/index', {
      user: req.session.user,
    });
  },
);

export default router;
