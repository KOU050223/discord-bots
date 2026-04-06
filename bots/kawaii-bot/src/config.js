import { createConfig } from '@discord-bots/shared';

// 環境変数を読み込み
const envConfig = createConfig({
  required: ['DISCORD_TOKEN', 'FORWARD_CHANNEL_ID'],
  optional: {
    NODE_ENV: 'development',
    LOG_LEVEL: 'info',
    TARGET_EMOJI_NAME: 'kawaii',
    TEXT_GACHA_URL: 'http://localhost:8080'
  }
});

// Bot固有の設定
export const config = {
  ...envConfig,

  // リアクション設定
  emoji: {
    name: envConfig.TARGET_EMOJI_NAME
  },

  // Haskellサービス
  textGachaUrl: envConfig.TEXT_GACHA_URL
};
