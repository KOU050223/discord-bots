# kawaii-bot

ディスコードサーバー上で`:kawaii:`リアクションが押されたメッセージを特定のチャンネルに転送するボットです。

## 機能

- カスタム絵文字`:kawaii:`のリアクション監視
- リアクションされたメッセージを指定チャンネルにEmbed形式で転送
- 元メッセージへのジャンプリンク付き
- 作者情報、チャンネル情報、添付ファイル情報を含む見やすい表示

## セットアップ

### 1. Discord Developer Portalでの設定

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 新しいアプリケーションを作成
3. 左メニューから「Bot」を選択
4. Bot Tokenを取得（「Reset Token」でトークン生成）
5. **重要**: Bot設定で以下のIntentsを有効化:
   - ✅ `PRESENCE INTENT`（Guilds）
   - ✅ `MESSAGE CONTENT INTENT`（必須）
   - ✅ `SERVER MEMBERS INTENT`
   - ✅ `GUILD MESSAGE REACTIONS`（必須）
6. 左メニューから「OAuth2」→「URL Generator」を選択
7. SCOPESで`bot`を選択
8. BOT PERMISSIONSで以下を選択:
   - Read Messages/View Channels
   - Send Messages
   - Embed Links
   - Read Message History
   - Add Reactions
9. 生成されたURLでBotをサーバーに招待

### 2. カスタム絵文字の準備

1. Discordサーバーで`:kawaii:`という名前のカスタム絵文字をアップロード
   - サーバー設定 → 絵文字 → 絵文字をアップロード
   - 名前を`kawaii`に設定

### 3. 転送先チャンネルの準備

1. メッセージを転送したいチャンネルを作成（既存チャンネルでも可）
2. 開発者モードを有効化（ユーザー設定 → 詳細設定 → 開発者モード）
3. チャンネルを右クリック → 「IDをコピー」

### 4. 環境変数の設定

```bash
cd bots/kawaii-bot
cp .env.example .env
```

`.env`ファイルを編集して以下を設定:

```env
DISCORD_TOKEN=your_bot_token_here
FORWARD_CHANNEL_ID=123456789012345678
TARGET_EMOJI_NAME=kawaii  # オプション
LOG_LEVEL=info            # オプション
NODE_ENV=development      # オプション
```

## 使い方

### ローカル実行

#### 開発モード（ファイル監視）
```bash
npm run dev
```

#### 本番モード
```bash
npm start
```

### Docker/Podman実行

#### 個別起動
```bash
cd bots/kawaii-bot
podman-compose up -d --build
podman-compose logs -f
```

#### ルートから一括起動
```bash
cd /home/kou050223/workspace/discord-bots
podman-compose up -d kawaii-bot
podman-compose logs -f kawaii-bot
```

## 動作確認

1. Discordサーバーで任意のメッセージを送信
2. そのメッセージに`:kawaii:`リアクションを追加
3. 指定した転送先チャンネルにEmbedでメッセージが転送される

### 期待されるログ出力

```
[kawaii-bot] INFO: Bot を起動中...
[kawaii-bot] SUCCESS: kawaii-bot#1234 としてログインしました
[kawaii-bot] INFO: リアクション監視: kawaii
[kawaii-bot] INFO: 転送先チャンネルID: 123456789012345678
[kawaii-bot] INFO: メッセージを転送しました リアクション: kawaii 元メッセージID: 987654321 送信者: user#5678
```

## トラブルシューティング

### Botがリアクションに反応しない

- Discord Developer Portalで`GUILD MESSAGE REACTIONS` Intentが有効か確認
- `MESSAGE CONTENT INTENT`も有効にする必要があります
- Bot Tokenが正しく設定されているか確認
- カスタム絵文字名が`.env`の`TARGET_EMOJI_NAME`と一致しているか確認

### メッセージが転送されない

- `FORWARD_CHANNEL_ID`が正しいか確認（開発者モードでコピーしたID）
- Botが転送先チャンネルにアクセス権限を持っているか確認
- チャンネルの権限設定で「メッセージを送信」「埋め込みリンク」が許可されているか確認

### "転送先チャンネルが見つかりません" エラー

- チャンネルIDが正しいか確認
- Botがそのサーバーに参加しているか確認
- チャンネルが削除されていないか確認

### "権限がありません" エラー

- チャンネルの権限設定でBotに以下を許可:
  - メッセージを送信
  - 埋め込みリンク
  - メッセージ履歴を読む

## 技術仕様

- **Node.js**: 24.0.0以上
- **Discord.js**: 14.16.0
- **必要なIntents**:
  - Guilds
  - GuildMessages
  - MessageContent
  - GuildMessageReactions

## ライセンス

このボットはdiscord-botsプロジェクトの一部です。
