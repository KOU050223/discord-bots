// Intent Presets - 一般的な Intent 組み合わせのプリセット

import { GatewayIntentBits } from 'discord.js';

export const IntentPresets = {
  // メッセージ読み取り専用Bot（リアクションなど）
  MESSAGE_READER: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],

  // 音楽Bot用
  MUSIC_BOT: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ],

  // 管理Bot用
  ADMIN_BOT: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],

  // リアクション監視Bot用
  REACTION_MONITOR: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
};

export function getIntents(preset) {
  if (!IntentPresets[preset]) {
    throw new Error(`Unknown intent preset: ${preset}`);
  }
  return IntentPresets[preset];
}
