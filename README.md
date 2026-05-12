# MoneLog

Google カレンダーをデータストアとして使う家計簿 PWA です。  
登録・集計・グラフ表示をブラウザだけで完結させ、ホーム画面へのインストールにも対応しています。

## 機能

- **収支登録** — 種別・カテゴリ・小カテゴリ・金額・メモを Google カレンダーのイベントとして保存
- **一覧表示** — 期間・種別・カテゴリでフィルタリング
- **集計** — カテゴリ別・小カテゴリ別の収支集計（ドリルダウンで明細まで確認可）
- **グラフ** — 支出カテゴリ円グラフ・日別／月別収支トレンド・曜日別集計
- **PWA** — ホーム画面インストール、オフラインキャッシュ対応
- **ダーク／ライトテーマ** 切り替え

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Vue 3 (Composition API) |
| ビルド | Vite |
| PWA | vite-plugin-pwa |
| グラフ | Chart.js / vue-chartjs |
| データ | Google Calendar API v3 |

## セットアップ

### 1. Google API の設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. **Google Calendar API** を有効化
3. **OAuth 2.0 クライアント ID** を作成（種別: ウェブアプリケーション）
4. 承認済みの JavaScript 生成元に `http://localhost:5173` を追加

### 2. 環境変数

`.env` ファイルをプロジェクトルートに作成し、クライアント ID を設定します。

```
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### 3. インストール・起動

```bash
npm install
npm run dev
```

## カレンダーイベントの形式

このアプリは以下の形式で Google カレンダーにイベントを書き込みます。

- **タイトル**: `【MoneLog】 支出 食費 ¥1,500`
- **説明**:
  ```
  種別：支出
  カテゴリ：食費
  小カテゴリ：コンビニ
  金額：1500円
  メモ：コーヒーとパン
  ```

Gemini などの AI からカレンダーに登録することで、会話形式での家計管理が可能です。
