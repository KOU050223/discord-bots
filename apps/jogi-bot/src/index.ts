import { createLogger, createShutdownManager } from '@discord-bots/shared';
import { createDiscordClient, setupErrorHandlers } from '@discord-bots/discord-api';
import { GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { setupKawaii } from './features/kawaii.js';
import { setupEyesLips } from './features/eyes-lips.js';
import { setupGacha } from './features/gacha.js';

const logger = createLogger('jogi-bot');

const client = createDiscordClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

setupErrorHandlers(client, logger);

client.once('ready', () => {
  logger.success(`${client.user!.tag} としてログインしました`);
  logger.info(`転送先チャンネルID: ${config.FORWARD_CHANNEL_ID}`);
});

setupKawaii(client, logger);
setupEyesLips(client, logger);
setupGacha(client, logger);

const shutdownManager = createShutdownManager(logger);
shutdownManager.onShutdown(async () => {
  logger.info('Discord クライアントを停止中...');
  await client.destroy();
});
shutdownManager.register();

logger.info('Bot を起動中...');
client.login(config.DISCORD_TOKEN).catch((error) => {
  logger.error('ログインに失敗しました:', error);
  process.exit(1);
});
