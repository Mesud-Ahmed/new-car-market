"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = __importDefault(require("./bot"));
async function main() {
    console.log('AutoFlow Ethiopia Bot starting...');
    await bot_1.default.start();
    console.log('Bot is running. Forward messages to test.');
}
main().catch((error) => {
    console.error('Failed to start bot', error);
    process.exit(1);
});
