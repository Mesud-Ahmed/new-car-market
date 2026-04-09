"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toErrorMessage = toErrorMessage;
exports.safeEditOrReply = safeEditOrReply;
exports.buildTelegramFileUrl = buildTelegramFileUrl;
const constants_1 = require("./constants");
function toErrorMessage(error) {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }
    return 'Unexpected error';
}
async function safeEditOrReply(ctx, message) {
    try {
        await ctx.editMessageText(message);
    }
    catch {
        await ctx.reply(message);
    }
}
function buildTelegramFileUrl(filePath) {
    return `${constants_1.TELEGRAM_FILE_BASE_URL}/${filePath}`;
}
