# Task Hierarchy - 階層型タスク管理アプリ

3階層で構成されたタスク管理アプリケーション。プロジェクト、ミッション、タスクの3レベルで構造化された管理ができます。

## 機能

- **3階層構造**：プロジェクト > ミッション > タスクの階層でタスクを管理
- **ダッシュボード**：全プロジェクトの概要と進捗状況を一目で確認
- **プロジェクト管理**：期限や優先度を設定可能
- **ミッション詳細**：各ミッションの詳細なステータスと関連タスク
- **レスポンシブデザイン**：スマートフォンからデスクトップまで対応

## 技術スタック

- React 17.0.2
- React Router DOM 6.2.1
- Parcel Bundler（ビルドツール）
- CSS（スタイリング）

## インストール方法

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/task-hierarchy.git

# プロジェクトディレクトリに移動
cd task-hierarchy

# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm start
```

## 使い方

1. **ダッシュボード画面**：
   - プロジェクト一覧の確認
   - 新規プロジェクトの作成
   - 全体の進捗状況の確認

2. **プロジェクト詳細画面**：
   - ミッション一覧の表示
   - 新規ミッションの追加
   - プロジェクトの編集・削除

3. **ミッション詳細画面**：
   - タスク一覧の表示と管理
   - タスクの追加・編集・削除
   - 進捗状況の更新

## プロジェクト構成

```
task-hierarchy/
├── public/            # 静的ファイル
├── src/               # ソースコード
│   ├── components/    # Reactコンポーネント
│   │   ├── Dashboard.js
│   │   ├── ProjectList.js
│   │   ├── ProjectDetails.js
│   │   ├── MissionDetails.js
│   │   └── Modal.js
│   ├── context/       # Reactコンテキスト
│   ├── App.js         # メインアプリコンポーネント
│   ├── index.js       # エントリーポイント
│   └── styles.css     # グローバルスタイル
├── package.json       # プロジェクト設定
└── README.md          # プロジェクト説明
```

## ビルド方法

開発用サーバー：
```bash
npm start
```

本番用ビルド：
```bash
npm run build
```

ビルド後のファイルは `dist` ディレクトリに生成されます。

## デプロイ方法

1. 本番用ビルドを実行：
   ```bash
   npm run build
   ```

2. `dist` ディレクトリの内容を任意のウェブサーバーにアップロード

3. または、Netlify、Vercel、GitHub Pagesなどのサービスを利用して自動デプロイを設定

## カスタマイズ

- `src/styles.css` でデザインをカスタマイズ
- `src/components` 内のファイルでコンポーネントの挙動を変更
- `src/context` でデータ管理ロジックを編集

## ライセンス

MITライセンス 
# task-hierarchy
