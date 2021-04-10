import createError, { HttpError } from 'http-errors';
import express, { NextFunction, Response, Request } from 'express';
import passport from 'passport';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import mongoStore from 'connect-mongo';
import session from 'express-session';
import logger from './util/logger';
import { COOKIE_SECRET, MONGODB_URI } from './util/secrets';
import initPassport from './init-passport';

import indexRouter from './routes';
import authRouter from './routes/auth';
import chatRouter from './routes/chat';
import postRouter from './routes/post';
import botRouter from './routes/bot';
import meetRouter from './routes/meet';
import jobRouter from './routes/job';
import recipesRouter from './routes/recipes';
import { UserRepo } from './models';

const app = express();

const MongoStore = mongoStore(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true,
  })
  .then(() => {
    logger.info('Connected to MongoDB Database');
  })
  .catch((err) => {
    logger.error('Error connecting to MongoDB Database', { err });
    process.exit(1);
  });

export const sessionMiddleware = session({
  resave: true,
  saveUninitialized: true,
  secret: COOKIE_SECRET,
  store: new MongoStore({
    url: MONGODB_URI,
  }),
  cookie: {
    maxAge: 7 * 24 * 3600 * 1000,
  },
});

app.set('trust proxy', 1);
app.use(sessionMiddleware);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!req?.session?.user) {
    res.redirect('/');
  } else {
    try {
      const user = await UserRepo.findOne({
        username: req.session.user.username,
      });

      if (!user) {
        throw new Error();
      }

      await new Promise((resolve, reject) => {
        req.login(user, (err) => {
          if (err) {
            reject(err);
          }

          resolve(null);
        });
      });

      next();
    } catch (err) {
      return next(createError('Could not restore user from session'));
    }
  }
});
app.use('/post', postRouter);
app.use('/bot', botRouter);
app.use('/meet', meetRouter);
app.use('/chat', chatRouter);
app.use('/job', jobRouter);
app.use('/recipes', recipesRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
app.use((err: HttpError, req: Request, res: Response) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err,
  });
});

export default app;
