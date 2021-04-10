import { Response, Request, Router } from 'express';
import { UserRepo, PostRepo } from '../models';
import { analyzePostTone } from '../util/analyze-tone';
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  if (!req?.session?.user) {
    res.render('login');
  } else {
    const { user } = req.session;
    const posts = await PostRepo.findAll();
    const message = await analyzePostTone(
      posts.filter((post) => post.author.username === user.username),
    );

    res.render('user/index', {
      user,
      posts,
      message,
    });
  }
});

export default router;
