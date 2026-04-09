"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TELEGRAM_FILE_BASE_URL = exports.PENDING_LISTING_TTL_MS = exports.TMA_URL = exports.CHANNEL_ID = void 0;
const config_1 = require("../config");
exports.CHANNEL_ID = config_1.env.CHANNEL_ID;
exports.TMA_URL = config_1.env.TMA_URL;
exports.PENDING_LISTING_TTL_MS = config_1.env.PENDING_LISTING_TTL_MS;
exports.TELEGRAM_FILE_BASE_URL = `https://api.telegram.org/file/bot${config_1.env.BOT_TOKEN}`;
