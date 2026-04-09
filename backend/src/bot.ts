import { Bot } from 'grammy';
import { registerBotHandlers } from './bot/handlers';
import { startPendingCleanup } from './bot/pending-listings-store';
import { env } from './config';

const bot = new Bot(env.BOT_TOKEN);

registerBotHandlers(bot);

bot.catch((error) => {
  console.error('Unhandled bot error', error);
});

startPendingCleanup();

export default bot;
