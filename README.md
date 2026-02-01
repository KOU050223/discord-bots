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