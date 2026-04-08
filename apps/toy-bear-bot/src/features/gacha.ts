import type { Client } from 'discord.js';
import type { Logger } from '@discord-bots/shared';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const TARGET_CHARS = '情報技術研究部'.split('');
const JYOGI_EMOJI = ':jyogi2014:';
const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data');
const RECORDS_FILE = join(DATA_DIR, 'gacha-records.json');

interface GachaRecord {
  username: string;
  userId: string;
  timestamp: string;
  rank: number;
}

interface GachaData {
  records: GachaRecord[];
}

function loadData(): GachaData {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(RECORDS_FILE)) {
    return { records: [] };
  }
  try {
    const raw = readFileSync(RECORDS_FILE, 'utf-8');
    return JSON.parse(raw) as GachaData;
  } catch {
    return { records: [] };
  }
}

function saveRecord(record: GachaRecord): void {
  const data = loadData();
  data.records.push(record);
  writeFileSync(RECORDS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function shuffleChars(): string[] {
  const arr = [...TARGET_CHARS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isAllCorrect(shuffled: string[]): boolean {
  return shuffled.every((char, i) => char === TARGET_CHARS[i]);
}

function formatResult(shuffled: string[]): string {
  const colored = shuffled.map((char, i) => {
    if (char === TARGET_CHARS[i]) {
      return `\x1b[32m${char}\x1b[0m`; // 緑色（当たり）
    }
    return char;
  });
  return `\`\`\`ansi\n${colored.join('')}\n\`\`\``;
}

export function setupGacha(client: Client, logger: Logger): void {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'gacha') return;

    await interaction.deferReply();
    const shuffled = shuffleChars();

    if (isAllCorrect(shuffled)) {
      const data = loadData();
      const rank = data.records.length + 1;
      const timestamp = new Date().toISOString();
      const username = interaction.user.username;
      const userId = interaction.user.id;

      saveRecord({ username, userId, timestamp, rank });

      const jyogiLine = Array(7).fill(JYOGI_EMOJI).join('');
      const message = `${jyogiLine}\nあなたが**${rank}人目**の情報技術研究部を揃えた人です`;
      await interaction.editReply(message);
    } else {
      await interaction.editReply(formatResult(shuffled));
    }
  });

  logger.info('gacha機能を初期化しました');
}
