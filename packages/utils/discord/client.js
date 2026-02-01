// Discord Client Helper - Client の初期化とログインヘルパー

import { Client } from 'discord.js';

export function createDiscordClient(options = {}) {
  const { intents, ...restOptions } = options;

  if (!intents || intents.length === 0) {
    throw new Error('Discord Client には少なくとも1つのIntentが必要です');
  }

  return new Client({
    intents,
    ...restOptions
  });
}

export async function loginClient(client, token, logger) {
  if (!token) {
    throw new Error('DISCORD_TOKEN が設定されていません');
  }

  try {
    await client.login(token);
    return client;
  } catch (error) {
    if (logger) {
      logger.error('Discord ログインに失敗:', error.message);
    }
    throw error;
  }
}
