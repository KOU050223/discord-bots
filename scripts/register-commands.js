#!/usr/bin/env node
/**
 * スラッシュコマンドをDiscordに登録するスクリプト
 *
 * 使い方:
 *   DISCORD_TOKEN=xxx DISCORD_CLIENT_ID=xxx node scripts/register-commands.js
 *
 * DISCORD_GUILD_ID を指定するとギルド限定コマンドとして登録（即時反映）
 * 省略するとグローバルコマンドとして登録（反映に最大1時間）
 */

import { REST, Routes } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  console.error('DISCORD_TOKEN と DISCORD_CLIENT_ID が必要です');
  process.exit(1);
}

const commands = [
  {
    name: 'gacha',
    description: '情報技術研究部の7文字をガチャる'
  }
];

const rest = new REST({ version: '10' }).setToken(token);

const route = guildId
  ? Routes.applicationGuildCommands(clientId, guildId)
  : Routes.applicationCommands(clientId);

try {
  console.log(`コマンドを登録中... (${guildId ? `ギルド: ${guildId}` : 'グローバル'})`);
  const result = await rest.put(route, { body: commands });
  console.log(`✓ ${result.length} 件のコマンドを登録しました`);
} catch (err) {
  console.error('コマンド登録に失敗しました:', err);
  process.exit(1);
}
