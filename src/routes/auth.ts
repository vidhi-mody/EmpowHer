import { Request, Response, Router } from 'express';
import passport from 'passport';
const router = Router();

router.get(
  '/user/login',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  }),
);

router.get(
  '/user/login/callback',
  passport.authenticate('google', {
    failureRedirect: '/err',
  }),
  async (req: Request, res: Response) => {
    if (req?.session?.passport?.user) {
      req.session.user = req.session.passport.user;

      return res.redirect('/?action=login');
    } else {
      res.redirect('/err');
    }
  },
);

router.get('/logout', (req: Request, res: Response) => {
  req?.session?.destroy(() => {
    res.redirect('/?action=logout');
  });
});

export default router;
