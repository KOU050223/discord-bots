# Discord Bots - セットアップと起動手順

このドキュメントでは、Monorepo構成のDiscordボットの起動手順を説明します。

## 前提条件

- Node.js 24以上（推奨）または Node.js 20以上
- npm (Node.js同梱)
- Podman または Docker（コンテナ環境を使用する場合）
- Discord Bot Token

---

## 開発環境での起動

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd discord-bots
```

### 2. 依存関係のインストール

**Monorepo全体の依存関係をインストール:**

```bash
# ルートディレクトリで実行
npm install
```

このコマンドで以下が実行されます:
- `packages/shared` の依存関係インストール
- `packages/utils` の依存関係インストール
- `bots/eyes-lips-bot` の依存関係インストール
- workspace間の自動リンク設定

### 3. 環境変数の設定

各ボットディレクトリで `.env` ファイルを作成:

```bash
cd bots/eyes-lips-bot
cp .env.example .env
```

`.env` を編集してトークンを設定:

```env
# Discord Bot Token（必須）
DISCORD_TOKEN=your_actual_token_here

# ログレベル（オプション: debug, info, warn, error）
LOG_LEVEL=info

# 環境（オプション: development, production）
NODE_ENV=development
```

### 4. ボットの起動

```bash
# eyes-lips-bot を起動
cd bots/eyes-lips-bot
npm start

# または開発モード（ファイル変更時に自動再起動）
npm run dev
```

**起動成功のログ例:**

```
[2026-02-02T12:00:00.000Z] ℹ️ [eyes-lips-bot] Bot を起動中...
[2026-02-02T12:00:01.500Z] ✅ [eyes-lips-bot] eyes-lips-bot#1234 としてログインしました
[2026-02-02T12:00:01.501Z] ℹ️ [eyes-lips-bot] メッセージを監視中: :eyes: または 👀
[2026-02-02T12:00:01.502Z] ℹ️ [eyes-lips-bot] リアクション: 👄 または 🫦
```

---

## 本番環境での起動（Podman/Docker）

### 1. 環境変数の設定

```bash
cd bots/eyes-lips-bot
cp .env.example .env
# .env を編集してトークンを設定
```

### 2. ビルドと起動

#### 方法A: 全てのボットを一括管理（推奨）

**ルートディレクトリから全ボットを起動:**

```bash
# リポジトリルートで実行
cd /path/to/discord-bots

# Podman の場合
podman-compose up -d --build

# Docker の場合
docker-compose up -d --build
```

**特定のボットのみ起動:**

```bash
# eyes-lips-bot のみ起動
podman-compose up -d eyes-lips-bot

# 複数のボットを起動（将来的に）
podman-compose up -d eyes-lips-bot music-bot
```

**ログの確認:**

```bash
# 全てのボットのログを表示
podman-compose logs -f

# 特定のボットのログを表示
podman-compose logs -f eyes-lips-bot
```

**停止:**

```bash
# 全てのボットを停止
podman-compose down

# 特定のボットのみ停止
podman-compose stop eyes-lips-bot
```

---

#### 方法B: 個別のボットを起動

**Podman Compose を使用:**

```bash
# eyes-lips-bot をビルド・起動（bots/eyes-lips-bot ディレクトリで実行）
cd bots/eyes-lips-bot
podman-compose up -d --build
```

**Docker Compose を使用:**

```bash
# eyes-lips-bot をビルド・起動（bots/eyes-lips-bot ディレクトリで実行）
cd bots/eyes-lips-bot
docker-compose up -d --build
```

**注意:** 個別起動の場合、ビルドコンテキストは `context: ../../` でリポジトリルート全体を指します。

### 3. 動作確認

ボットが正常に起動したら、Discord でテスト:
- eyes-lips-bot: `:eyes:` メッセージを送信 → `👄` または `🫦` でリアクション

---

## トラブルシューティング

### エラー: `Cannot find package '@discord-bots/shared'`

**原因:** workspace の依存関係が正しくインストールされていない

**解決策:**

```bash
# ルートディレクトリで再インストール
cd /path/to/discord-bots
rm -rf node_modules package-lock.json
rm -rf bots/*/node_modules
rm -rf packages/*/node_modules
npm install
```

### Docker ビルドエラー: `packages/ not found`

**原因:** ビルドコンテキストが正しくない

**解決策:**

`docker-compose.yml` の `context` がリポジトリルート (`../../`) を指していることを確認してください。

```yaml
build:
  context: ../../  # これが重要
  dockerfile: bots/eyes-lips-bot/Containerfile
```

### 環境変数が読み込まれない

**原因:** `.env` ファイルが存在しない、または場所が間違っている

**解決策:**

1. `.env` ファイルが各ボットディレクトリに存在することを確認
   ```bash
   ls bots/eyes-lips-bot/.env
   ```
2. `DISCORD_TOKEN` が正しく設定されていることを確認
   ```bash
   cat bots/eyes-lips-bot/.env
   ```
3. Docker環境の場合、`docker-compose.yml` の `env_file` を確認

### ログインエラー: `Invalid token`

**原因:** Discord Bot Token が無効または間違っている

**解決策:**

1. [Discord Developer Portal](https://discord.com/developers/applications) でトークンを確認
2. `.env` ファイルのトークンを再確認（前後にスペースがないか確認）
3. トークンを再生成して `.env` を更新

### Node.js バージョン警告

**警告例:**
```
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'eyes-lips-bot@1.0.0',
npm WARN EBADENGINE   required: { node: '>=24.0.0' },
npm WARN EBADENGINE   current: { node: 'v20.19.2', npm: '9.2.0' }
npm WARN EBADENGINE }
```

**原因:** Node.js のバージョンが24未満

**解決策:**

この警告は無視しても動作しますが、Node.js 24以上にアップグレードすることを推奨します。

```bash
# nvm を使用している場合
nvm install 24
nvm use 24
```

---

## 新しいボットの追加

新しいボットを追加する手順:

### 1. ボットディレクトリの作成

```bash
mkdir -p bots/my-new-bot/src
cd bots/my-new-bot
```

### 2. package.json の作成

```json
{
  "name": "my-new-bot",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "@discord-bots/shared": "*",
    "@discord-bots/utils": "*",
    "discord.js": "^14.16.0"
  }
}
```

### 3. 依存関係のインストール

```bash
# ルートディレクトリで実行
cd /path/to/discord-bots
npm install
```

### 4. ボットロジックの実装

eyes-lips-bot を参考に、以下のファイルを作成:
- `src/config.js` - 設定管理
- `src/bot.js` - メインロジック
- `src/index.js` - エントリーポイント

### 5. 環境変数の設定

```bash
cd bots/my-new-bot
cp ../eyes-lips-bot/.env.example .env
# .env を編集
```

### 6. ボットの起動

```bash
npm start
```

---

## 共通モジュールの使い方

### Logger の使用

```javascript
import { createLogger } from '@discord-bots/shared';

const logger = createLogger('my-bot-name');

logger.debug('デバッグメッセージ');
logger.info('情報メッセージ');
logger.warn('警告メッセージ');
logger.error('エラーメッセージ');
logger.success('成功メッセージ');
```

### Config の使用

```javascript
import { createConfig } from '@discord-bots/shared';

const config = createConfig({
  required: ['DISCORD_TOKEN'],
  optional: {
    LOG_LEVEL: 'info',
    NODE_ENV: 'development'
  }
});

console.log(config.DISCORD_TOKEN);
```

### Discord Client の使用

```javascript
import { createDiscordClient, IntentPresets, setupErrorHandlers } from '@discord-bots/utils';
import { createLogger } from '@discord-bots/shared';

const logger = createLogger('my-bot');
const client = createDiscordClient({
  intents: IntentPresets.MESSAGE_READER
});

setupErrorHandlers(client, logger);
```

### Shutdown Manager の使用

```javascript
import { createShutdownManager } from '@discord-bots/shared';

const shutdownManager = createShutdownManager(logger);
shutdownManager.onShutdown(async () => {
  logger.info('クリーンアップ処理...');
  await client.destroy();
});
shutdownManager.register();
```

---

## 参考リンク

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord.js ドキュメント](https://discord.js.org/)
- [Node.js ドキュメント](https://nodejs.org/)
- [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
