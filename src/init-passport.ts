import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { UserDocument } from 'types';
import logger from './util/logger';
import * as UserRepo from './models/user/repo';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} from './util/secrets';

const initPassport = (): void => {
  try {
    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser(async (user: UserDocument, done) => {
      done(null, user);
    });

    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const existingUser = await UserRepo.findOne({
              email: profile.email,
            });

            if (existingUser) {
              return done(null, existingUser);
            }

            const newUser = await UserRepo.createOne({
              accessToken: accessToken,
              refreshToken: refreshToken,
              name: profile.displayName,
              email: profile.email,
              username: profile.email.split('@')[0],
              profilePicture: profile.photos[0].value,
            });

            return done(null, newUser);
          } catch (err) {
            logger.error('Error authenticating user', { err });
            return done(true, null);
          }
        },
      ),
    );
  } catch (err) {
    logger.error('Error initializing passport', { err });
    throw err;
  }
};

export default initPassport;
