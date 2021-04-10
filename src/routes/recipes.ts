import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import createError from 'http-errors';
import logger from '../util/logger';
const router = Router();

router.get('/find', async (req: Request, res: Response, next: NextFunction) => {
  if (!req?.session?.user) {
    next(createError(401, 'Please login to view this page'));
  }

  res.render('recipes/find', {
    user: req?.session?.user,
  });
});

router.get(
  '/recipe/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      next(createError(401, 'Please login to view this page'));
    }
    axios
      .get(
        `https://api.spoonacular.com/recipes/${req.params.id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`,
      )
      .then((response) => {
        const recipe = response.data;
        res.render('recipes/recipe', { user: req?.session?.user, recipe });
      })
      .catch((error) => {
        console.log(error);
        res.render('recipes/find', {
          user: req?.session?.user,
        });
      });
  },
);

router.post(
  '/find',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      return next(createError(401, 'Please login to view this page'));
    }
    try {
      const { query, number } = req.body;
      const params = {
        ingredients: query,
        number: number,
        ranking: 1,
        ignorePantry: false,
      };

      axios
        .get(
          `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${process.env.SPOONACULAR_API_KEY}`,
          {
            params: params,
          },
        )
        .then((response) => {
          const recipes = response.data;
          res.render('recipes/list', { user: req?.session?.user, recipes });
        });
    } catch (err) {
      logger.error('Failed to create meet', { err });
      next(createError(500, 'Failed to fetch recipes'));
    }
  },
);

export default router;
