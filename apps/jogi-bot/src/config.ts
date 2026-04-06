import { createConfig } from '@discord-bots/shared';

const envConfig = createConfig({
  required: ['DISCORD_TOKEN', 'FORWARD_CHANNEL_ID'],
  optional: {
    NODE_ENV: 'development',
    LOG_LEVEL: 'info',
    TARGET_EMOJI_NAME: 'kawaii',
    TEXT_GACHA_URL: 'http://localhost:8080',
  },
});

export const config = {
  DISCORD_TOKEN: envConfig.DISCORD_TOKEN,
  FORWARD_CHANNEL_ID: envConfig.FORWARD_CHANNEL_ID,
  NODE_ENV: envConfig.NODE_ENV,
  LOG_LEVEL: envConfig.LOG_LEVEL,
  kawaii: {
    emojiName: envConfig.TARGET_EMOJI_NAME,
    textGachaUrl: envConfig.TEXT_GACHA_URL,
  },
  eyesLips: {
    triggers: [':eyes:', '👀'],
    responses: ['👄', '🫦'],
  },
};
