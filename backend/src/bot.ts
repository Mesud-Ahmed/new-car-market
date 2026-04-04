import { Bot, Context, InlineKeyboard } from 'grammy';
import { supabase } from './supabase';
import { uploadToCloudinary } from './cloudinary';
import { extractCarData } from './gemini';
import { pendingListings } from './types';

const bot = new Bot(process.env.BOT_TOKEN!);
const CHANNEL_ID = Number(process.env.CHANNEL_ID!);

bot.command('start', (ctx) => {
  ctx.reply(
    `🚗 Welcome to AutoFlow Ethiopia!\n\n` +
    `Send the messy car text first.\n` +
    `Then send the photos.`
  );
});

bot.command('status', async (ctx) => {
  const { count } = await supabase.from('listings').select('*', { count: 'exact', head: true });
  ctx.reply(`✅ Bot running\nListings: ${count || 0}`);
});

// ──────────────────────────────────────────────
// STEP 1: User sends messy TEXT
bot.on('message:text', async (ctx: Context) => {
  if (ctx.message.text?.startsWith('/')) return;

  const userId = ctx.from!.id;
  const pending = pendingListings.get(userId);

  // Prevent sending text while in photo stage
  if (pending && pending.photos.length === 0) {
    return ctx.reply('📸 Please send the car photos now.');
  }

  const rawText = ctx.message.text;

  await ctx.reply('🔄 Creating beautiful listing...');

  try {
    const result = await extractCarData(rawText);

    pendingListings.set(userId, {
      userId,
      chatId: ctx.chat!.id,
      rawText,
      extracted: result,
      photos: [],
    });

    await ctx.reply(result.formatted_post, { parse_mode: 'HTML' });

    await ctx.reply(`📸 Now send the car photos.\nYou can send multiple in one message.`);
  } catch (err: any) {
    console.error(err);
    await ctx.reply(`❌ Error: ${err.message}`);
  }
});

// ──────────────────────────────────────────────
// STEP 2: User sends PHOTOS
bot.on('message:photo', async (ctx: Context) => {
  const userId = ctx.from!.id;
  const pending = pendingListings.get(userId);

  if (!pending) return ctx.reply('Please send the car text first.');

  // Show uploading message only once
  if (pending.photos.length === 0) {
    await ctx.reply('📸 Uploading & watermarking photos...');
  }

  try {
    const photos: string[] = [];
    const photoArray = ctx.message.photo || [];
    const biggestPhoto = photoArray.at(-1)!;

    const file = await ctx.api.getFile(biggestPhoto.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
    const watermarkedUrl = await uploadToCloudinary(fileUrl);
    photos.push(watermarkedUrl);

    pending.photos = [...pending.photos, ...photos];

    // Short confirmation for every photo
    await ctx.reply(`✅ Photo added (${pending.photos.length} total)`);

    // Show Confirm & Post button ONLY ONCE (after first photo)
    if (pending.photos.length === 1) {
      const keyboard = new InlineKeyboard()
        .text('✅ Confirm & Post', `confirm:${userId}`);

      await ctx.reply(
        `🎉 All photos ready!\n\nClick the button below to post the beautiful listing to the channel.`,
        { reply_markup: keyboard }
      );
    }
  } catch (err: any) {
    await ctx.reply(`❌ Photo error: ${err.message}`);
  }
});

// ──────────────────────────────────────────────
// CONFIRM & POST
bot.callbackQuery(/confirm:(.+)/, async (ctx) => {
  const userId = Number(ctx.match[1]);
  const pending = pendingListings.get(userId);

  if (!pending || pending.photos.length === 0) {
    return ctx.answerCallbackQuery('Please upload photos first!');
  }

  await ctx.answerCallbackQuery('Posting beautiful listing...');

  let finalPost = pending.extracted.formatted_post;
  finalPost += `\n\n🌐 <a href="https://t.me/FreedomeCarMarketBot/app">View Full Showroom</a>`;

  const sentMessage = await bot.api.sendMediaGroup(
    CHANNEL_ID,
    pending.photos.map((url, i) => ({
      type: 'photo',
      media: url,
      caption: i === 0 ? finalPost : undefined,
      parse_mode: 'HTML',
    }))
  );

  const messageId = sentMessage[0].message_id;

  await supabase.from('listings').insert({
    status: 'posted',
    telegram_message_id: messageId.toString(),
    telegram_chat_id: CHANNEL_ID,
    ...pending.extracted,
    photos: pending.photos,
  });

  await ctx.editMessageText('✅ Beautiful listing posted to channel! 🎉');
  pendingListings.delete(userId);
});

export default bot;