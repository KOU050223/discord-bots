// Config Manager - 環境変数の読み込みと検証

import dotenv from 'dotenv';

export class ConfigManager {
  constructor(options = {}) {
    // .env ファイルのロード
    dotenv.config({ path: options.envPath });
    this.required = options.required || [];
    this.optional = options.optional || {};
  }

  load() {
    const config = {};

    // 必須項目の検証
    for (const key of this.required) {
      const value = process.env[key];
      if (!value) {
        throw new Error(`必須の環境変数 ${key} が設定されていません`);
      }
      config[key] = value;
    }

    // オプション項目（デフォルト値付き）
    for (const [key, defaultValue] of Object.entries(this.optional)) {
      config[key] = process.env[key] || defaultValue;
    }

    return config;
  }

  validate(config, schema) {
    // 簡易的なバリデーション
    for (const [key, validator] of Object.entries(schema)) {
      if (typeof validator === 'function') {
        if (!validator(config[key])) {
          throw new Error(`設定値 ${key} が無効です: ${config[key]}`);
        }
      }
    }
    return true;
  }
}

export function createConfig(options) {
  const manager = new ConfigManager(options);
  return manager.load();
}
