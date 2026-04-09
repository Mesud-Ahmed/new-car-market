import { env } from '../config';

export const CHANNEL_ID = env.CHANNEL_ID;
export const TMA_URL = env.TMA_URL;
export const PENDING_LISTING_TTL_MS = env.PENDING_LISTING_TTL_MS;

export const TELEGRAM_FILE_BASE_URL = `https://api.telegram.org/file/bot${env.BOT_TOKEN}`;
