# FAIRWAY — ゴルフスコア分析 (Golf Score Analyzer)

`golfbu_kun`（Flutter/Firebase アプリ）の **スコア分析機能**を、バックエンド非依存の
**静的Webアプリ**として再構築したものです。ゴルフ1ラウンドのスコアを入力すると、
フェアウェイキープ率・パーオン率・パット傾向などを**クライアント側だけ**で集計・可視化します。

- データは端末内（`localStorage`）のみで処理され、外部サーバーには送信されません。
- 認証・DB（Firebase）には依存しません。GitHub Pages で無料公開できます。
- スタック: **Vite + React + Recharts**。

## 機能

- ラウンド設定（コース名・プレーヤー・日付・各ホールのパー）
- 18ホールの**詳細入力**（打数 / パット / ティーショットのクラブと結果 / パーオン残距離・クラブ・結果 /
  初打パットの残距離・方向・距離感 / グリーンサイドバンカー / OB / 池 / 罰打）
- クラシックなスコアカード表示（OUT / IN / TOTAL、対パーの丸・四角表記）
- スコア分析（元 `score_card_view.dart` の全項目を忠実に再現）
  - スコア構成、Par別平均、ティーショット分析、クラブ別FWキープ率、
    パーオン（距離別・クラブ別）、パットミス傾向、距離帯別パット（2.5m/5m/10m以内・10m以上）、
    アプローチ、バンカー、バーディーチャンス、ミス分析
- グラフ可視化（スコア構成、ホール別 To par、パット数推移、総合レーダー、パーオン距離別）

## 計算ロジック

元アプリ `lib/features/score_card/widgets/score_card_preview.dart` の集計処理を
`src/lib/analyze.js` に忠実に移植しています。主な定義:

- **パーオン**: `打数 − パット数 ≤ par − 2`
- スコア区分: `打数 − par` が ≥2 ダボ以上 / =1 ボギー / =0 パー / =−1 バーディ / ≤−2 イーグル以下
- 各種率 = 達成数 / 試行数 × 100（小数1桁、分母0は「—」表示）
- バーディチャンス: パーオン かつ 初打残5m以内
- 100yd以内グリーン外し = (50yd試行+100yd試行) − (50yd達成+100yd達成)

> 注: 元コードで集計が未実装だった「池」「罰打」は、入力データがあるため本実装では正しく集計しています。

## ローカル開発

```bash
npm install
npm run dev      # 開発サーバ
npm run build    # dist/ に本番ビルド
npm run preview  # ビルド結果をプレビュー
```

## GitHub Pages へ公開

### 方法A: 単一ファイルをアップロード（スマホ・GitHub Webだけで完結／推奨）

ビルド済みの全部入り `standalone/index.html`（または `npm run build` で出る
`dist/index.html`）を1枚アップロードするだけ。ターミナル不要。

1. GitHub で **public** リポジトリ（例: `golf-score-analyzer`）を新規作成
2. リポジトリで **Add file → Upload files**、`index.html` を1枚アップロードして commit（`main`）
3. **Settings → Pages → Source: Deploy from a branch**、Branch を `main` / `(root)` にして Save
4. 1分ほどで `https://<user>.github.io/golf-score-analyzer/` に公開

> `index.html` は全JS/CSSを内包し、外部依存はGoogle Fontsのみ。ビルドもActionsも不要です。

### 方法B: ソースから自動ビルド（開発者向け）

このフォルダの中身を新しい public リポジトリのルートに置いて push し、
**Settings → Pages → Source: GitHub Actions** に設定すると、`.github/workflows/deploy.yml`
が `npm run build` してPagesへ自動デプロイします。

`vite.config.js` は `base: "./"`（相対パス）なので、リポジトリ名に関わらず
`https://<user>.github.io/<repo>/` で正しく動作します。
