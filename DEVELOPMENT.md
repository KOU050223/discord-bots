# Discord Bots - 開発ガイド

このドキュメントでは、Discord ボットの開発フロー、修正、テスト、デプロイの手順を説明します。

---

## 🔄 開発フロー

### 1️⃣ ローカル開発(推奨)

コードを修正しながら素早く動作確認できます。

```bash
# ボットのディレクトリに移動
cd bots/kawaii-bot  # または bots/eyes-lips-bot

# .envファイルを設定
# DISCORD_TOKEN などを記入

# 開発モードで起動(ファイル変更を自動検知)
npm run dev

# または通常起動
npm start
```

**メリット**:
- 起動が速い
- コード変更が即座に反映される(devモード)
- デバッグしやすい
- 依存関係のインストールが不要(ルートで `npm install` 済みの場合)

---

### 2️⃣ Dockerでテスト

本番環境に近い状態で動作確認します。

```bash
# プロジェクトのルートディレクトリで

# 特定のボットだけビルド&起動
podman compose up kawaii-bot --build

# または全ボットを起動
podman compose up --build

# バックグラウンドで起動する場合
podman compose up -d --build
```

**コンテナの操作**:
```bash
# ログを確認
podman compose logs kawaii-bot
podman compose logs -f kawaii-bot  # リアルタイム表示

# コンテナを停止
podman compose stop

# コンテナを停止して削除
podman compose down

# イメージも削除したい場合
podman compose down --rmi all
```

**メリット**:
- 本番環境と同じ環境で動作確認できる
- 複数のボットを同時に起動できる
- 依存関係の問題を事前に検出できる

---

### 3️⃣ デプロイ(本番環境)

```bash
# 1. コードをコミット
git add .
git commit -m "feat: 新機能を追加"
git push

# 2. 本番サーバーで(またはCI/CD経由で)
git pull

# 3. イメージを再ビルド
podman compose build --no-cache

# 4. コンテナを再起動
podman compose up -d

# 5. ログで動作確認
podman compose logs -f
```

---

## 📝 典型的な開発サイクル

### パターン1: 小さな修正・バグフィックス

```bash
# ステップ1: コード修正
vim bots/kawaii-bot/src/index.js

# ステップ2: ローカルでテスト
cd bots/kawaii-bot
npm run dev
# → 動作確認したら Ctrl+C で停止

# ステップ3: コミット&デプロイ
cd ../..  # ルートに戻る
git add .
git commit -m "fix: バグ修正"
git push

# ステップ4: 本番環境で再起動
podman compose down
podman compose up -d --build
```

### パターン2: 大きな機能追加

```bash
# ステップ1: コード修正
vim bots/kawaii-bot/src/index.js
vim bots/kawaii-bot/src/new-feature.js

# ステップ2: ローカルでテスト
cd bots/kawaii-bot
npm run dev
# → 動作確認したら Ctrl+C で停止

# ステップ3: Dockerでテスト
cd ../..  # ルートに戻る
podman compose up kawaii-bot --build
# → 問題なければ Ctrl+C で停止

# ステップ4: コミット&デプロイ
git add .
git commit -m "feat: 新機能を追加"
git push

# ステップ5: 本番環境で再起動
podman compose down
podman compose up -d --build
podman compose logs -f kawaii-bot
```

### パターン3: 依存関係の更新

```bash
# ステップ1: 依存関係を更新
npm install discord.js@latest

# ステップ2: ローカルでテスト
cd bots/kawaii-bot
npm start
# → 動作確認したら Ctrl+C で停止

# ステップ3: Dockerでテスト(重要!)
cd ../..
podman compose build --no-cache
podman compose up kawaii-bot
# → 問題なければ Ctrl+C で停止

# ステップ4: コミット&デプロイ
git add package.json package-lock.json
git commit -m "chore: discord.jsを更新"
git push

# ステップ5: 本番環境で再起動
podman compose down
podman compose build --no-cache
podman compose up -d
```

---

## 🔧 トラブルシューティング

### キャッシュをクリアして完全再ビルド

```bash
# Dockerイメージのキャッシュをクリア
podman compose build --no-cache

# 依存関係を再インストール
npm install

# 古いコンテナとイメージを全削除
podman compose down --rmi all --volumes
```

### workspace の依存関係がおかしくなった場合

```bash
# node_modulesを全削除して再インストール
rm -rf node_modules package-lock.json
rm -rf bots/*/node_modules
rm -rf packages/*/node_modules
npm install
```

### コンテナが起動しない場合

```bash
# 既存のコンテナを強制削除
podman compose down --remove-orphans

# イメージを再ビルド
podman compose build --no-cache

# 起動
podman compose up
```

---

## 🚀 便利なコマンド

### 開発中によく使うコマンド

```bash
# ルートで全ボットの依存関係をインストール
npm install

# 特定のボットのログをリアルタイム表示
podman compose logs -f kawaii-bot

# 全ボットのログをリアルタイム表示
podman compose logs -f

# コンテナの状態を確認
podman compose ps

# 特定のボットだけ再起動
podman compose restart kawaii-bot

# 全ボットを再起動
podman compose restart
```

### デバッグ用コマンド

```bash
# コンテナ内でコマンドを実行
podman compose exec kawaii-bot sh

# コンテナのリソース使用状況を確認
podman stats

# 特定のボットだけ停止
podman compose stop kawaii-bot

# 特定のボットだけ起動
podman compose start kawaii-bot
```

---

## 📊 開発のベストプラクティス

### 1. ローカル優先で開発

- **開発中はローカル実行を使う**: Docker は本番環境に近いテストのみに使用
- **`npm run dev` を活用**: ファイル変更を自動検知してくれる

### 2. テストは段階的に

1. ローカルで基本動作を確認
2. Docker で本番環境に近い状態でテスト
3. 問題なければデプロイ

### 3. コミット前に必ず動作確認

- ローカルで動いても Docker で動かない場合がある
- 依存関係の問題は Docker で発覚しやすい

### 4. ログを活用

```javascript
import { createLogger } from '@discord-bots/shared';

const logger = createLogger('my-bot');
logger.debug('デバッグ情報');  // 開発中のみ表示
logger.info('情報');           // 通常の情報
logger.error('エラー', error); // エラー情報
```

### 5. 環境変数を正しく管理

- `.env` ファイルは Git に含めない(`.gitignore` で除外)
- `.env.example` を用意してテンプレートを共有
- 本番環境とローカルで同じ `.env` 形式を使う

---

## 📁 ファイル構成の理解

```
discord-bots/
├── package.json          # Workspace設定
├── package-lock.json     # 依存関係のロック
├── docker-compose.yml    # 全ボット一括管理
├── DEVELOPMENT.md        # このファイル
├── SETUP.md              # 初回セットアップ手順
├── README.md             # プロジェクト概要
├── packages/
│   ├── shared/           # 共通ロジック(logger, config, lifecycle)
│   └── utils/            # 共通ツール(Discord client, intents, errors)
└── bots/
    ├── eyes-lips-bot/    # :eyes: に反応するBot
    │   ├── src/
    │   │   ├── index.js  # エントリーポイント
    │   │   ├── bot.js    # メインロジック
    │   │   └── config.js # 設定管理
    │   ├── package.json
    │   ├── Containerfile # Dockerイメージ定義
    │   └── .env          # 環境変数(Git管理外)
    └── kawaii-bot/       # :kawaii: リアクションBot
        ├── src/
        ├── package.json
        ├── Containerfile
        └── .env
```

---

## 🔗 関連ドキュメント

- **[README.md](./README.md)** - プロジェクト概要と基本的な使い方
- **[SETUP.md](./SETUP.md)** - 環境構築、起動手順、トラブルシューティング
- **[docker-commands.md](./docker-commands.md)** - Podman/Dockerコマンド集

---

## 💡 Tips

### Docker と Podman の違い

このプロジェクトでは **Podman** を推奨していますが、**Docker** でも動作します。

```bash
# Podman の場合
podman compose up -d

# Docker の場合
docker compose up -d
```

コマンドは基本的に同じです。`podman` を `docker` に置き換えるだけで動作します。

### バックグラウンド実行

本番環境では `-d` (detached mode) を使ってバックグラウンドで実行します。

```bash
# バックグラウンドで起動
podman compose up -d

# ログを確認
podman compose logs -f

# 停止
podman compose down
```

### 特定のボットだけ再ビルド

```bash
# kawaii-bot だけ再ビルド
podman compose build kawaii-bot

# 再起動
podman compose up -d kawaii-bot
```
