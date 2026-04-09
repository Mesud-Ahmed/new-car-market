"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const handlers_1 = require("./bot/handlers");
const pending_listings_store_1 = require("./bot/pending-listings-store");
const config_1 = require("./config");
const bot = new grammy_1.Bot(config_1.env.BOT_TOKEN);
(0, handlers_1.registerBotHandlers)(bot);
bot.catch((error) => {
    console.error('Unhandled bot error', error);
});
(0, pending_listings_store_1.startPendingCleanup)();
exports.default = bot;
