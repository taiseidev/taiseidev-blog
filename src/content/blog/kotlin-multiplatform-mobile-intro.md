---
title: Kotlin Multiplatform Mobile（KMM）を触ってみた
description: iOSとAndroidでビジネスロジックを共通化できるKotlin Multiplatform Mobileの概要と、最初の一歩をまとめます。
duration: 15min
date: 2023-12-3
lang: ja-JP
draft: false
category: tech
tag: Kotlin, KMM, Multiplatform, iOS, Android
---

## はじめに

「iOSとAndroid、どちらも同じロジックを書くのは面倒だ...」と感じたことがある方も多いはず。
Flutterのようなクロスプラットフォームは有力な選択肢ですが、UIはネイティブのまま、ロジックだけ共通化したい場合にマッチするのが[Kotlin Multiplatform Mobile (KMM)](https://kotlinlang.org/lp/multiplatform/)です。

本記事では、KMMの全体像と最初の一歩をまとめます。

## KMMとは

- Kotlinで書いたコードをiOS/Android両方で使えるようにする仕組み
- Android側はKotlinそのまま、iOS側はObjective-Cフレームワーク経由でSwiftから呼び出し
- UIは各プラットフォームでネイティブ実装

**UIまで共通化したい場合は[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)の方が適しています。**
KMMは「ロジック層の共通化」に集中できる、というのが特徴です。

## 何が共通化できるのか

例えばこんなコードが共通モジュールに置けます。

- API通信（Ktor Clientが代表例）
- データベース（SQLDelightなど）
- ドメインロジック（Use Case等）
- Entity/DTOの定義

プラットフォーム固有のAPIは`expect/actual`という仕組みで吸収します。

## プロジェクト構成

典型的なKMMプロジェクトはこのような構成になります。

```
shared/
  commonMain/   # 共通コード
  androidMain/  # Android固有実装
  iosMain/      # iOS固有実装
androidApp/     # Android UI
iosApp/         # iOS UI（Xcodeプロジェクト）
```

`shared`モジュールが両プラットフォームで共有されるコア部分です。

## expect / actual の例

例えば時刻を取得する処理は、プラットフォームごとに実装を分けられます。

```kotlin
// commonMain
expect fun currentTimestamp(): Long

// androidMain
actual fun currentTimestamp(): Long = System.currentTimeMillis()

// iosMain
import platform.Foundation.NSDate
import platform.Foundation.timeIntervalSince1970

actual fun currentTimestamp(): Long =
    (NSDate().timeIntervalSince1970 * 1000).toLong()
```

共通コードからは`currentTimestamp()`を呼ぶだけ。
プラットフォーム実装の切り替えはコンパイラが面倒をみてくれます。

## Ktorで共通のAPIクライアントを書く

```kotlin
class UserApi(private val client: HttpClient) {
    suspend fun getUser(id: Long): UserDto =
        client.get("https://api.example.com/users/$id").body()
}
```

このコードが、AndroidでもiOSでも**そのまま動きます**。
これはシンプルな例ですが、実務でも大部分のロジックをこのように共通化できるのは非常にインパクトがあります。

## iOSでの利用

共通コードはXcodeからはObjective-Cのフレームワークとして見えるので、Swiftから呼ぶことができます。

```swift
let api = UserApi(client: ...)

Task {
    let user = try await api.getUser(id: 1)
    print(user.name)
}
```

Kotlinの`suspend`関数はSwiftから`async/await`で呼べるので、そこまで違和感はありません。

## 導入してみて感じたメリット/デメリット

### メリット
- ビジネスロジックの2重実装が不要になる
- テストも共通に書ける
- iOSのUIはSwiftUI/UIKitのまま、ユーザー体験を犠牲にしなくていい

### デメリット
- セットアップがやや重い（Xcode/Gradle/CocoaPodsの連携）
- Kotlin Nativeの挙動（メモリモデル等）を別途理解する必要がある
- iOS側のビルド時間が長くなりがち

## どんなプロジェクトに向くか

個人的には以下のような場面に強いと感じます。

- すでにAndroid/iOSのネイティブアプリがある
- 両アプリでビジネスロジックが重複してきている
- UIはネイティブのままキープしたい

逆に「一人で両OS対応をゼロから作る」場合はFlutterやCompose Multiplatformの方が圧倒的に楽かもしれません。

## おわりに

KMMは「UIはネイティブのまま、ロジックだけ共通化する」という現実的な選択肢を提供してくれます。
Jetpack系のKotlinライブラリの多くがマルチプラットフォーム対応を進めているので、今後さらに選択肢としての存在感が増していきそうです。

## 参考文献

- [Kotlin Multiplatform公式](https://kotlinlang.org/lp/multiplatform/)
- [KMMのドキュメント](https://kotlinlang.org/docs/multiplatform-mobile-getting-started.html)
