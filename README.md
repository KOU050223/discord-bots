# Discord-Bot

このリポジトリは、複数のDiscordボットを管理するためのMonorepo構成を採用しています。各ボットは独立したパッケージとして管理され、共通のロジックやツールは別のパッケージとして切り出されています。

```
discord-bots/
├── package.json          (全体の管理・共通設定)
├── packages/             
│   ├── shared/           (★共通ロジック：DB接続、ログ設定、共通関数)
│   │   ├── index.js
│   │   └── package.json  (name: "@myproject/shared")
│   └── utils/            (★共通ツール)
└── bots/
    ├── music-bot/        (Bot A)
    │   ├── index.js
    │   └── package.json  (依存関係に "@myproject/shared" を追加)
    └── admin-bot/        (Bot B)
        ├── index.js
        └── package.json
```


## 共通化の手順（Workspaces）
### 1. ルートの package.json を設定
プロジェクトのルートで、「どこにパッケージがあるか」を宣言します。

```JSON
{
  "name": "my-discord-bots",
  "private": true,
  "workspaces": [
    "packages/*",
    "bots/*"
  ]
}
```

### 2. 共通モジュールを作る
packages/shared/package.json を作成し、名前を付けます。

```JSON
{
  "name": "@myproject/shared",
  "version": "1.0.0",
  "main": "index.js"
}
```
index.js で共通のDiscord設定や、エラーハンドラーを export します。

### 3. 各Botから呼び出す
各Botの package.json の dependencies に "@myproject/shared": "*" を追加するだけで、通常のnpmパッケージのように require または import できるようになります。

```JavaScript

// bots/music-bot/index.js
const { commonLogger } = require('@myproject/shared');

commonLogger('Music Bot started!');
```

この方法のメリット
一括インストール: ルートで npm install するだけで、全Botの依存関係が解決されます。
コードの重複なし: 共通処理を直しても、各Botのコードを書き換える必要がありません。
シンボリックリンク: npmが自動的にリンクを張ってくれるので、ファイルをコピーする手間がゼロです。

---

## 実際のプロジェクト構成

現在のリポジトリは以下の構成になっています:

```
discord-bots/
├── package.json                # Workspace設定
├── docker-compose.yml          # 全ボット一括管理
├── SETUP.md                    # 起動手順とトラブルシューティング
├── docker-commands.md          # Podman/Dockerコマンド集
├── packages/
│   ├── shared/                 # 共通ロジック
│   │   ├── logger/             # 統一ロガー（レベル別、タイムスタンプ）
│   │   ├── config/             # 環境変数管理
│   │   ├── lifecycle/          # グレースフルシャットダウン
│   │   ├── index.js
│   │   └── package.json        # @discord-bots/shared
│   └── utils/                  # 共通ツール
│       ├── discord/            # Discord Client ヘルパー、Intentプリセット
│       ├── errors/             # エラーハンドラー
│       ├── index.js
│       └── package.json        # @discord-bots/utils
└── bots/
    └── eyes-lips-bot/          # :eyes: に反応するBot
        ├── src/
        │   ├── index.js
        │   ├── bot.js
        │   └── config.js
        ├── package.json
        ├── Containerfile
        └── docker-compose.yml  # 個別起動用
```

---

## クイックスタート

### 開発環境

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数の設定
cd bots/eyes-lips-bot
cp .env.example .env
# .env を編集してDISCORD_TOKENを設定

# 3. ボットの起動
npm start
```

### 本番環境（Docker/Podman）

```bash
# 1. 環境変数の設定
cd bots/eyes-lips-bot
cp .env.example .env
# .env を編集

# 2. ルートから全ボットを一括起動
cd /path/to/discord-bots
podman-compose up -d --build

# 3. ログの確認
podman-compose logs -f eyes-lips-bot
```

詳細は [SETUP.md](./SETUP.md) を参照してください。

---

## 共通モジュールの使い方

### Logger

```javascript
import { createLogger } from '@discord-bots/shared';

const logger = createLogger('my-bot');
logger.info('Bot起動中...');
logger.success('ログイン成功');
logger.error('エラー発生:', error);
```

### Config

```javascript
import { createConfig } from '@discord-bots/shared';

const config = createConfig({
  required: ['DISCORD_TOKEN'],
  optional: { LOG_LEVEL: 'info' }
});
```

### Discord Client

```javascript
import { createDiscordClient, IntentPresets } from '@discord-bots/utils';

const client = createDiscordClient({
  intents: IntentPresets.MESSAGE_READER
});
```

### Shutdown Manager

```javascript
import { createShutdownManager } from '@discord-bots/shared';

const shutdownManager = createShutdownManager(logger);
shutdownManager.onShutdown(async () => {
  await client.destroy();
});
shutdownManager.register();
```

---

## ドキュメント

- **[SETUP.md](./SETUP.md)** - 環境構築、起動手順、トラブルシューティング
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - 開発フロー、修正、テスト、デプロイ手順
- **[docker-commands.md](./docker-commands.md)** - Podman/Dockerコマンド集

---

## ボットの追加

新しいボットを追加する場合:

1. `bots/my-new-bot` ディレクトリを作成
2. `package.json` に依存関係を追加:
   ```json
   {
     "dependencies": {
       "@discord-bots/shared": "*",
       "@discord-bots/utils": "*",
       "discord.js": "^14.16.0"
     }
   }
   ```
3. ルートで `npm install`
4. `docker-compose.yml` にサービスを追加

詳細は [SETUP.md](./SETUP.md) の「新しいボットの追加」を参照してください。