import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

if (!process.env.IBM_TONE_API_KEY) {
  logger.error('IBM API must be specified');
  process.exit(1);
}

if (!process.env.IBM_TONE_API_URL) {
  logger.error('IBM API Url must be specified');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  logger.error('MongoDB connection string must be specified');
  process.exit(1);
}

if (!process.env.COOKIE_SECRET) {
  logger.error('Session secret must be specified');
  process.exit(1);
}

if (
  !(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
  )
) {
  logger.error('Missing Google OAuth credentials');
  process.exit(1);
}

export const COOKIE_SECRET = <string>process.env.COOKIE_SECRET;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

export const NODE_ENV = process.env.NODE_ENV || 'development';

export const MONGODB_URI = process.env.MONGODB_URI;

export const IBM_TONE_API_KEY = process.env.IBM_TONE_API_KEY;
export const IBM_TONE_API_URL = process.env.IBM_TONE_API_URL;
