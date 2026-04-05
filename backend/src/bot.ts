import { Bot, Context, InlineKeyboard } from 'grammy';
import { uploadToCloudinary } from './cloudinary';
import { env } from './config';
import { extractCarData } from './gemini';
import { supabase } from './supabase';
import { pendingListings, type PendingListing } from './types';

const bot = new Bot(env.BOT_TOKEN);
const CHANNEL_ID = env.CHANNEL_ID;
const TMA_URL = env.TMA_URL;
const PENDING_LISTING_TTL_MS = env.PENDING_LISTING_TTL_MS;

const TELEGRAM_FILE_BASE_URL = `https://api.telegram.org/file/bot${env.BOT_TOKEN}`;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Unexpected error';
}

function isExpired(pending: PendingListing): boolean {
  return Date.now() - pending.createdAt > PENDING_LISTING_TTL_MS;
}

function getPendingListing(userId: number): PendingListing | undefined {
  const pending = pendingListings.get(userId);
  if (!pending) {
    return undefined;
  }
  if (!isExpired(pending)) {
    return pending;
  }
  pendingListings.delete(userId);
  return undefined;
}

function startPendingCleanup(): void {
  const cleanupTimer = setInterval(() => {
    for (const [userId, pending] of pendingListings.entries()) {
      if (isExpired(pending)) {
        pendingListings.delete(userId);
      }
    }
  }, Math.min(Math.max(Math.floor(PENDING_LISTING_TTL_MS / 2), 60_000), 5 * 60_000));

  cleanupTimer.unref();
}

async function safeEditOrReply(ctx: Context, message: string): Promise<void> {
  try {
    await ctx.editMessageText(message);
  } catch {
    await ctx.reply(message);
  }
}

bot.command('start', async (ctx) => {
  await ctx.reply(
    `🚗 Welcome to AutoFlow Ethiopia!\n\n` +
      `Send the messy car text first.\n` +
      `Then send the photos.`,
  );
});

bot.command('status', async (ctx) => {
  try {
    const { count, error } = await supabase.from('listings').select('*', { count: 'exact', head: true });
    if (error) {
      throw new Error(error.message);
    }
    await ctx.reply(`✅ Bot running\nListings: ${count ?? 0}`);
  } catch (error) {
    await ctx.reply(`❌ Status error: ${toErrorMessage(error)}`);
  }
});

// STEP 1: User sends messy TEXT
bot.on('message:text', async (ctx: Context) => {
  const messageText = ctx.message?.text;
  if (!messageText || messageText.startsWith('/')) {
    return;
  }

  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  if (!userId || !chatId) {
    return;
  }

  const pending = getPendingListing(userId);
  if (pending && pending.photos.length === 0) {
    await ctx.reply('📸 Please send the car photos now (you can send multiple).');
    return;
  }

  await ctx.reply('🔄 Creating beautiful listing...');

  try {
    const extracted = await extractCarData(messageText);

    pendingListings.set(userId, {
      userId,
      chatId,
      rawText: messageText,
      extracted,
      photos: [],
      createdAt: Date.now(),
    });

    await ctx.reply(extracted.formatted_post, { parse_mode: 'HTML' });
    await ctx.reply(`📸 Now send the car photos.\nYou can send multiple photos in one message.`);
  } catch (error) {
    console.error('Failed to extract car data', error);
    await ctx.reply(`❌ Error: ${toErrorMessage(error)}`);
  }
});

// STEP 2: User sends PHOTOS
bot.on('message:photo', async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) {
    return;
  }

  const pending = getPendingListing(userId);
  if (!pending) {
    await ctx.reply('Please send the car text first.');
    return;
  }

  if (pending.photos.length === 0) {
    await ctx.reply('📸 Uploading & watermarking photos...');
  }

  try {
    const biggestPhoto = ctx.message?.photo?.at(-1);
    if (!biggestPhoto) {
      throw new Error('Photo payload is missing');
    }

    const file = await ctx.api.getFile(biggestPhoto.file_id);
    if (!file.file_path) {
      throw new Error('Could not resolve Telegram photo path');
    }

    const fileUrl = `${TELEGRAM_FILE_BASE_URL}/${file.file_path}`;
    const watermarkedUrl = await uploadToCloudinary(fileUrl);
    pending.photos.push(watermarkedUrl);

    if (pending.photos.length === 1) {
      const keyboard = new InlineKeyboard().text('✅ Confirm & Post', `confirm:${userId}`);
      await ctx.reply(
        `🎉 Photos are ready!\n\nClick the button below to post the beautiful listing to the channel.`,
        { reply_markup: keyboard },
      );
    }
  } catch (error) {
    console.error('Failed to process photo', error);
    await ctx.reply(`❌ Photo error: ${toErrorMessage(error)}`);
  }
});

// CONFIRM & POST
bot.callbackQuery(/confirm:(\d+)/, async (ctx) => {
  const ownerUserId = Number(ctx.match[1]);
  const actorUserId = ctx.from?.id;

  if (!Number.isInteger(ownerUserId)) {
    await ctx.answerCallbackQuery('Invalid listing');
    return;
  }

  if (!actorUserId || actorUserId !== ownerUserId) {
    await ctx.answerCallbackQuery('Only the listing owner can post this.');
    return;
  }

  const pending = getPendingListing(ownerUserId);
  if (!pending || pending.photos.length === 0) {
    await ctx.answerCallbackQuery('Please upload photos first!');
    return;
  }

  await ctx.answerCallbackQuery('Posting beautiful listing...');

  const finalPost = `${pending.extracted.formatted_post}\n\n🌐 <a href="${TMA_URL}">View Full Showroom</a>`;

  try {
    const sentMessages = await bot.api.sendMediaGroup(
      CHANNEL_ID,
      pending.photos.map((url, index) => ({
        type: 'photo' as const,
        media: url,
        caption: index === 0 ? finalPost : undefined,
        parse_mode: 'HTML' as const,
      })),
    );

    const firstMessage = sentMessages[0];
    if (!firstMessage) {
      throw new Error('Telegram did not return posted messages');
    }

    const { error } = await supabase.from('listings').insert({
      status: 'posted',
      telegram_message_id: firstMessage.message_id.toString(),
      telegram_chat_id: CHANNEL_ID,
      ...pending.extracted,
      photos: pending.photos,
    });

    if (error) {
      throw new Error(`Failed to save listing: ${error.message}`);
    }

    pendingListings.delete(ownerUserId);
    await safeEditOrReply(ctx, '✅ Beautiful listing posted to channel! 🎉');
  } catch (error) {
    console.error('Failed to confirm and post listing', error);
    await safeEditOrReply(ctx, `❌ Failed to post listing: ${toErrorMessage(error)}`);
  }
});

bot.catch((error) => {
  console.error('Unhandled bot error', error);
});

startPendingCleanup();

export default bot;
