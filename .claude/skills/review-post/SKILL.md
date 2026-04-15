---
name: review-post
description: このリポジトリのブログ記事（src/content/blog/*.md）を公開前にレビューする。frontmatter・本文・画像パス・画像サイズ・ビルド可否を網羅的にチェックしてレポートする。公開は行わない。引数に対象記事のスラッグまたはファイルパスを受け取る（例: `/review-post 20260317-kamakura-snap`）。
---

# 記事レビュー

引数で指定された記事（`src/content/blog/<slug>.md` もしくは直接のパス）を対象に、以下の項目を順に検証してレポートする。**公開（コミット/プッシュ）は行わない。** 問題があれば箇条書きで列挙し、重大なものは優先度つきで示す。

## 1. frontmatter 検証

`src/content/config.ts` の blog スキーマと照合しつつ、以下を確認する:

- **必須**: `title`, `date`, `category`（`life` / `hobby` / `photo` / `tech` のいずれか）
- **推奨**: `description`（50〜160字、SEO/OG に使われる）、`lang`（通常 `ja-JP`）
- **任意**: `duration`（`10min` 形式、未指定なら本文から自動算出）、`tag`, `image`（`src` と `alt`）、`photos`（photo カテゴリ時）
- **公開チェック**: `draft: true` のままなら警告。公開するなら `draft: false` or 削除が必要
- `description` が記事の要約になっているか、本文の冒頭の単なる貼り付けになっていないか

## 2. 画像パスの検証

本文と frontmatter の全画像参照について:

- ✗ `../../../public/images/...` のような相対パス（Astro ではビルド後に解決されない）
- ✗ Qiita 等の外部 S3 URL の残骸
- ✓ `/images/<slug>/...` のような絶対パスが正しい

指定されたファイルが `public/images/` 配下に**実在**するかを `ls` で確認する。存在しないものは赤信号。

## 3. photo カテゴリ固有のチェック

`category: photo` の場合:

- `photos:` 配列が存在し、空でないこと
- 配列要素の記法（文字列形式 `- /images/...` と オブジェクト形式 `- src: /images/...`）が混在していないか
- 各画像が `public/images/<slug>/` に実在
- **画像サイズ**: 各ファイル 300KB〜1MB 程度が目安。5MB を超えるファイルは警告、10MB 超は強く警告
  - `du -sh public/images/<slug>/*.jpg` で確認
  - 肥大しているファイルがある場合は、レポートの「要修正」欄に以下のバッチコマンドを提示する（実行は `/publish-post` 側が担当）:
    ```bash
    cd public/images/<slug> && for f in *.jpg; do sips -Z 2000 -s format jpeg -s formatOptions 85 "$f" --out "$f"; done
    ```
  - 単発で 1 枚だけ直すなら `sips -Z 2000 -s format jpeg -s formatOptions 85 <file> --out <file>`

## 4. 本文の品質チェック

- 見出しレベルの整合: 記事全体で h1 を使わず h2 以降を使う（自動 TOC は h2 を拾う）
- **孤立した Qiita 記法**: `:::` で始まる/終わる行、`::: note`、`::: message` 等の残骸
- 他サイトからの **drafts URL** が残っていないか（例: `https://qiita.com/drafts/...`）
- 明らかな typo（過去実例: `Darth` → `Dart`、`riverpod_generatar` → `riverpod_generator`）
- **手動目次セクション**（`## 目次` 等）: 現在は h2 から自動 TOC が生成されるので、手動目次は重複

## 5. ビルド確認

```bash
npm run build 2>&1 | tail -15
```

- エラーなく完了するか
- 対象記事のページが `dist/posts/<slug>/index.html` に生成されているか
- コンソールに warning が出ていないか（broken link 等）

## 6. lint

```bash
npm run lint 2>&1 | tail -5
```

問題があれば `npm run lint:fix` で自動修正を提案。

## レポート形式

最終的に以下のフォーマットで報告する:

```
## 対象: <slug>

### ✅ 問題なし
- 〜〜

### ⚠️ 警告
- 〜〜

### ❌ 要修正（公開前に必須）
- 〜〜

### 次のステップ
公開可能 / 〇〇を修正してから再レビュー推奨
```

問題がなければ「`/publish-post <slug>` で公開に進めます」と案内する。
