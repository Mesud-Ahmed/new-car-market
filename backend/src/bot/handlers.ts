import { type Bot, type Context, InlineKeyboard } from 'grammy';
import { uploadToCloudinary } from '../cloudinary';
import { extractCarData } from '../gemini';
import { countListings, savePostedListing } from '../services/listings-repository';
import { CHANNEL_ID, TMA_URL } from './constants';
import {
  deletePendingListing,
  getPendingListing,
  setPendingListing,
} from './pending-listings-store';
import { buildTelegramFileUrl, safeEditOrReply, toErrorMessage } from './utils';

export function registerBotHandlers(bot: Bot): void {
  bot.command('start', async (ctx) => {
    await ctx.reply(
      `Welcome to AutoFlow Ethiopia!\n\n` +
        `Send the messy car text first.\n` +
        `Then send the photos.`,
    );
  });

  bot.command('status', async (ctx) => {
    try {
      const listingCount = await countListings();
      await ctx.reply(`Bot running\nListings: ${listingCount}`);
    } catch (error) {
      await ctx.reply(`Status error: ${toErrorMessage(error)}`);
    }
  });

  // Step 1: parse a new listing from free-form dealer text.
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

    const pendingListing = getPendingListing(userId);
    if (pendingListing && pendingListing.photos.length === 0) {
      await ctx.reply('Please send the car photos now (you can send multiple).');
      return;
    }

    await ctx.reply('Creating beautiful listing...');

    try {
      const extractedData = await extractCarData(messageText);

      setPendingListing(userId, {
        userId,
        chatId,
        rawText: messageText,
        extracted: extractedData,
        photos: [],
        createdAt: Date.now(),
      });

      await ctx.reply(extractedData.formatted_post, { parse_mode: 'HTML' });
      await ctx.reply(`Now send the car photos.\nYou can send multiple photos in one message.`);
    } catch (error) {
      console.error('Failed to extract car data', error);
      await ctx.reply(`Error: ${toErrorMessage(error)}`);
    }
  });

  // Step 2: attach one or more photos to the pending listing.
  bot.on('message:photo', async (ctx: Context) => {
    const userId = ctx.from?.id;
    if (!userId) {
      return;
    }

    const pendingListing = getPendingListing(userId);
    if (!pendingListing) {
      await ctx.reply('Please send the car text first.');
      return;
    }

    if (pendingListing.photos.length === 0) {
      await ctx.reply('Uploading and watermarking photos...');
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

      const fileUrl = buildTelegramFileUrl(file.file_path);
      const watermarkedUrl = await uploadToCloudinary(fileUrl);
      pendingListing.photos.push(watermarkedUrl);

      if (pendingListing.photos.length === 1) {
        const keyboard = new InlineKeyboard().text('Confirm and Post', `confirm:${userId}`);
        await ctx.reply(
          `Photos are ready.\n\nClick the button below to post the beautiful listing to the channel.`,
          { reply_markup: keyboard },
        );
      }
    } catch (error) {
      console.error('Failed to process photo', error);
      await ctx.reply(`Photo error: ${toErrorMessage(error)}`);
    }
  });

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

    const pendingListing = getPendingListing(ownerUserId);
    if (!pendingListing || pendingListing.photos.length === 0) {
      await ctx.answerCallbackQuery('Please upload photos first!');
      return;
    }

    await ctx.answerCallbackQuery('Posting beautiful listing...');

    const finalPost = `${pendingListing.extracted.formatted_post}\n\n<a href="${TMA_URL}">View Full Showroom</a>`;

    try {
      const sentMessages = await bot.api.sendMediaGroup(
        CHANNEL_ID,
        pendingListing.photos.map((photoUrl, index) => ({
          type: 'photo' as const,
          media: photoUrl,
          caption: index === 0 ? finalPost : undefined,
          parse_mode: 'HTML' as const,
        })),
      );

      const firstMessage = sentMessages[0];
      if (!firstMessage) {
        throw new Error('Telegram did not return posted messages');
      }

      await savePostedListing({
        channelId: CHANNEL_ID,
        extracted: pendingListing.extracted,
        photos: pendingListing.photos,
        telegramMessageId: firstMessage.message_id.toString(),
      });

      deletePendingListing(ownerUserId);
      await safeEditOrReply(ctx, 'Beautiful listing posted to channel.');
    } catch (error) {
      console.error('Failed to confirm and post listing', error);
      await safeEditOrReply(ctx, `Failed to post listing: ${toErrorMessage(error)}`);
    }
  });
}
