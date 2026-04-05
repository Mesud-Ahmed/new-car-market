import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const IntFromString = z
  .string()
  .trim()
  .regex(/^-?\d+$/, 'must be an integer')
  .transform((value) => Number(value));

const UrlString = z.string().trim().url();

const EnvSchema = z.object({
  BOT_TOKEN: z.string().trim().min(1),
  CHANNEL_ID: IntFromString,
  CLOUDINARY_CLOUD_NAME: z.string().trim().min(1),
  CLOUDINARY_API_KEY: z.string().trim().min(1),
  CLOUDINARY_API_SECRET: z.string().trim().min(1),
  GEMINI_API_KEY: z.string().trim().min(1),
  SUPABASE_URL: UrlString,
  SUPABASE_ANON_KEY: z.string().trim().min(1),
  TMA_URL: UrlString.optional().default('https://new-car-market-plum.vercel.app/'),
  PENDING_LISTING_TTL_MS: z.coerce.number().int().positive().optional().default(30 * 60 * 1000),
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid backend environment configuration: ${details}`);
}

export const env = parsedEnv.data;
