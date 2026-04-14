# 記事の書き方

このブログは Astro の Content Collections を使っています。`src/content/blog/<slug>.md` に
Markdown ファイルを置くだけで記事として公開されます。

---

## 1. ファイルの作り方

### 置き場所
```
src/content/blog/<slug>.md
```
ファイル名がそのまま URL のスラッグになります。
例: `spring-walk.md` → `/posts/spring-walk`

### 画像の置き場所
| 用途 | 置き場所 | 例 |
|---|---|---|
| OGP 画像（SNS シェア用） | `public/ogp/` | `public/ogp/spring-walk.png` |
| 本文中の画像 | `public/images/<slug>/` | `public/images/spring-walk/01.jpg` |

本文から参照するパスはいずれも `/` 始まり。`public/` は書かない。
```md
![桜並木](/images/spring-walk/01.jpg)
```

---

## 2. frontmatter

記事先頭の `---` で囲まれた YAML ブロック。すべてのフィールドは `src/content/config.ts`
で型定義されているので、抜けや誤字があるとビルドエラーになります。

### 必須
| キー | 型 | 説明 |
|---|---|---|
| `title` | string | 記事タイトル |
| `date` | string (YYYY-M-D) | 公開日 |

### よく使う任意項目
| キー | 型 | 説明 |
|---|---|---|
| `description` | string | 記事の概要（OGPや検索結果で使用） |
| `category` | `life` / `hobby` / `photo` / `tech` | 指定しなければ `life` |
| `tag` | string | カンマ区切りのタグ（例: `散歩, 桜`） |
| `image.src` | string | OGP画像のパス |
| `image.alt` | string | OGP画像の代替テキスト |
| `duration` | string | 読了目安（例: `10min`） |
| `draft` | boolean | `true` で本番ビルドから除外 |
| `lang` | string | 既定は `en-US`、日本語記事は `ja-JP` |

### テンプレート
```yaml
---
title: 春の散歩道
description: 桜並木を歩いた記録
date: 2026-04-14
category: life
lang: ja-JP
tag: 散歩, 桜
image:
  src: /ogp/spring-walk.png
  alt: 桜並木の写真
---
```

---

## 3. 使える Markdown 記法

このブログは **CommonMark + GitHub Flavored Markdown (GFM)** が利用できます。
加えて、コードブロックは [Shiki](https://shiki.style/) で色付けされます。

### 見出し
```md
## 大見出し（h2）
### 中見出し（h3）
#### 小見出し（h4）
```
※ `#`（h1）は記事タイトルとして自動出力されるので、本文では使わないでください。

### 段落と改行
段落は空行で区切ります。同じ段落内で改行したい場合は行末に半角スペースを2つ置く。

### 強調
```md
**太字** *斜体* ~~取り消し線~~ `インラインコード`
```

### リンク
```md
[テキスト](https://example.com)
```

### 画像
```md
![代替テキスト](/images/<slug>/01.jpg)
```

### 箇条書き
```md
- 項目A
- 項目B
  - ネスト可

1. 番号付き
2. 項目
```

### タスクリスト
```md
- [ ] 未完了
- [x] 完了
```

### 引用
```md
> 引用文はこのように書く。
> 複数行もOK。
```

### コードブロック
言語名を指定するとシンタックスハイライトされます。
<pre>
```kotlin
fun greet(name: String) = "Hello, $name"
```
</pre>

テーマは `github-light-default` / `github-dark-default` の自動切替。

### 表
```md
| 左寄せ | 中央 | 右寄せ |
|:---|:---:|---:|
| A | B | C |
```

### 水平線
```md
---
```

---

## 4. photo カテゴリの書き方

photo カテゴリは、frontmatter の `photos:` に画像パスを並べるだけで、
**自動でギャラリー表示**されます（本文にMarkdown画像を書く必要はありません）。

```md
---
title: 2026 春の東京
date: 2026-04-14
category: photo
lang: ja-JP
photos:
  # 単なる画像パスだけならこの形式
  - /images/2026-spring-tokyo/01.jpg
  # キャプションを付けたい場合はオブジェクト形式で
  - src: /images/2026-spring-tokyo/02.jpg
    caption: 朝の神田川
  - /images/2026-spring-tokyo/03.jpg
---

本文を書きたい場合はここに書く。散歩の感想など。
この本文はギャラリーの上に表示されます。
```

### ギャラリーの動作
- 1カラム（モバイル）／ 2カラム（PC）の masonry 風レイアウト
- 画像クリックで新規タブに原寸表示
- 画像はアスペクト比そのまま、画質優先

### 画像のリサイズ
カメラ撮影の JPG は 1枚 5〜15MB と大きいので、アップ前に `sips` で縮小することを推奨:
```bash
sips -Z 2000 -s format jpeg -s formatOptions 85 input.jpg --out output.jpg
```
`-Z 2000` は最長辺を 2000px に制限、`formatOptions 85` は JPEG品質85。
1枚 300KB〜1MB程度に収まります。

---

## 5. 投稿までのフロー

```bash
# 1. ローカルで書きながらプレビュー
npm run dev
# → http://localhost:1977

# 2. ビルドが通るか確認
npm run build

# 3. コミット & プッシュ（Netlify が自動でデプロイ）
git add .
git commit -m "add: 春の散歩道"
git push
```

### 下書きを残したまま push したいとき
`draft: true` を frontmatter に入れると、本番ビルドからは除外されます（ローカルでは表示される）。

---

## 6. 注意点

- ファイル名（スラッグ）は **半角英数字とハイフンのみ**。日本語スラッグは避ける（URLでエンコードされて可読性が落ちる）
- `date` は時刻ではなく日付のみ。並び順は日付の降順
- 画像ファイル名もできれば英数字で。大きすぎる場合は事前に圧縮しておく（1枚 500KB 以下目安）
- コード例を書くときは、フェンス言語名が間違っていると `[Shiki] The language "xxx" doesn't exist` の警告が出る（ビルドは通る）
