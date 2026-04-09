"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const IntFromString = zod_1.z
    .string()
    .trim()
    .regex(/^-?\d+$/, 'must be an integer')
    .transform((value) => Number(value));
const UrlString = zod_1.z.string().trim().url();
const EnvSchema = zod_1.z.object({
    BOT_TOKEN: zod_1.z.string().trim().min(1),
    CHANNEL_ID: IntFromString,
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().trim().min(1),
    CLOUDINARY_API_KEY: zod_1.z.string().trim().min(1),
    CLOUDINARY_API_SECRET: zod_1.z.string().trim().min(1),
    GEMINI_API_KEY: zod_1.z.string().trim().min(1),
    SUPABASE_URL: UrlString,
    SUPABASE_ANON_KEY: zod_1.z.string().trim().min(1),
    TMA_URL: UrlString.optional().default('https://new-car-market-plum.vercel.app/'),
    PENDING_LISTING_TTL_MS: zod_1.z.coerce.number().int().positive().optional().default(30 * 60 * 1000),
});
const parsedEnv = EnvSchema.safeParse(process.env);
if (!parsedEnv.success) {
    const details = parsedEnv.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid backend environment configuration: ${details}`);
}
exports.env = parsedEnv.data;
