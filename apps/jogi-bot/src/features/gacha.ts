import type { Client } from 'discord.js';
import type { Logger } from '@discord-bots/shared';
import { config } from '../config.js';

export function setupGacha(client: Client, logger: Logger): void {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'gacha') return;

    await interaction.deferReply();
    const result = await fetchGacha(config.kawaii.textGachaUrl, logger);
    await interaction.editReply(result ?? 'ガチャに失敗しました…');
  });

  logger.info('gacha機能を初期化しました');
}

async function fetchGacha(url: string, logger: Logger): Promise<string | null> {
  try {
    const res = await fetch(`${url}/gacha`, {
      method: 'POST',
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const { result } = await res.json() as { result: string };
    return result;
  } catch (err) {
    logger.warn('text-gachaサービス呼び出し失敗:', err);
    return null;
  }
}
