import type { Context } from 'grammy';
import { TELEGRAM_FILE_BASE_URL } from './constants';

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Unexpected error';
}

export async function safeEditOrReply(ctx: Context, message: string): Promise<void> {
  try {
    await ctx.editMessageText(message);
  } catch {
    await ctx.reply(message);
  }
}

export function buildTelegramFileUrl(filePath: string): string {
  return `${TELEGRAM_FILE_BASE_URL}/${filePath}`;
}
