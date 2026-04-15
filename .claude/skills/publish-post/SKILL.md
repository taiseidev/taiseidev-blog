---
name: publish-post
description: このリポジトリのブログ記事（src/content/blog/*.md）を公開する。事前に review-post と同等のチェックを通し、画像最適化・ビルド確認・コミット・プッシュまでを安全な順序で実行する。引数に対象記事のスラッグを受け取る（例: `/publish-post 20260317-kamakura-snap`）。
---

# 記事公開フロー

引数で指定された記事を公開する。**破壊的な操作（画像の上書き、コミット、push）はユーザーに確認を取ってから**実行する。ユーザーから durable な許可（CLAUDE.md 等）がない限り、各ステップで停止して確認する。

## ステップ 1: 事前レビュー

`review-post` と同じ項目を全て通す:

- frontmatter の必須項目（title, date, category）と `draft: false`
- 画像パスの正しさと実在確認
- photo カテゴリなら photos 配列と画像サイズ
- 本文の孤立 Qiita 記法・drafts URL・手動目次
- `npm run build` と `npm run lint` が通る

**何か引っかかれば、そこで停止してユーザーに修正を促す。**

## ステップ 2: 画像最適化（photo カテゴリ／image 指定がある場合）

`public/images/<slug>/` 配下の `*.jpg` / `*.png` を走査し、サイズを一覧表示する:

```bash
du -sh public/images/<slug>/*
```

**判定基準**（1枚あたり）:
- 〜1MB: 目安内。最適化不要
- 1MB〜5MB: 要検討（警告）
- 5MB 超: 要対応（強く推奨）
- 10MB 超: ほぼ必須

該当ファイルがあれば合計サイズと内訳を提示し、以下の選択肢をユーザーに提示:

- **A. 一括で in-place 縮小**（推奨・複数枚ある photo 記事向け）:
  ```bash
  cd public/images/<slug> && for f in *.jpg; do sips -Z 2000 -s format jpeg -s formatOptions 85 "$f" --out "$f"; done
  ```
  長辺 2000px・JPEG 品質 85 にリサイズ。原本上書きなので高解像度は失われる。
- **B. 特定の1枚だけ縮小**: `sips -Z 2000 -s format jpeg -s formatOptions 85 <file> --out <file>`
- **C. 原本を別場所に退避してから縮小**: 例 `~/Pictures/originals/<slug>/` に移動してから A/B を実行
- **D. そのままコミット**: リポジトリサイズは膨らむが画質を最大限保つ（閾値内ならこれで OK）

**ユーザーの明示的な許可を得るまで `sips` を実行しない**（原本上書きは不可逆）。縮小後はもう一度 `du -sh` で before/after を並べて見せる。

## ステップ 3: 最終ビルド & lint

```bash
npm run build
npm run lint
```

両方がクリーンに通ることを確認。失敗したら公開を中止して報告。

## ステップ 4: コミット

既存のコミット規約に従う:

- prefix 絵文字: `🚀 add:` (新規記事/機能), `🐛 fix:` (修正), `💅 style:` (見た目), `🧹 chore:` (掃除), `🔧 chore:` (設定)
- 日本語で記述
- 本文は「何を公開するか」「なぜこのタイミングか」を簡潔に

記事ファイルと関連画像ディレクトリをまとめて1コミットにする:

```bash
git add src/content/blog/<slug>.md public/images/<slug>/
git commit -m "$(cat <<'EOF'
🚀 add: <記事タイトル>を公開

<1-2行で内容の要約や公開に至った文脈>

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

pre-commit hook で lint:fix が走るので、追加修正が入った場合は再確認する。

## ステップ 5: プッシュ

push は共有リソースへの変更なので、コミット完了後に**再度ユーザーの明示的な了承を取ってから**実行する:

```bash
git push origin main
```

## ステップ 6: 完了報告

- デプロイ先の URL を示す（このリポジトリは Vercel デプロイの場合、`https://taiseidev.com/posts/<slug>/`）
- 公開された記事の内容を1行で要約

## 画像パスの規約（参考）

- 公開画像は `public/images/<slug>/<n>.jpg` の形で配置
- frontmatter / 本文からは `/images/<slug>/<n>.jpg` の絶対パスで参照
- 相対パス（`../../../public/...`）は使わない（ビルド後に解決不能）

## エラー時のふるまい

- ビルドが失敗: 公開中止、原因を調査
- push 失敗（衝突等）: `git pull --rebase` を提案、勝手に `--force` しない
- pre-commit hook 失敗: hook をスキップせず（`--no-verify` 禁止）、lint エラーを修正してから再度コミット
