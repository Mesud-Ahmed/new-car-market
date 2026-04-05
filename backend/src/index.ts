import bot from './bot';

async function main() {
  console.log('AutoFlow Ethiopia Bot starting...');
  await bot.start();
  console.log('Bot is running. Forward messages to test.');
}

main().catch((error) => {
  console.error('Failed to start bot', error);
  process.exit(1);
});
