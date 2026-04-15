---
title: Jetpack Composeで始めるAndroid UI開発
description: 宣言的UIツールキットJetpack Composeの基本概念と、シンプルな画面を作るところまでを紹介します。
duration: 15min
date: 2023-8-15
lang: ja-JP
draft: false
category: tech
tag: Android, Jetpack Compose, Kotlin
---

## はじめに

AndroidのUI開発といえば、長らくXMLレイアウト + Activity/Fragmentという構成が一般的でした。
そこに登場したのが[Jetpack Compose](https://developer.android.com/jetpack/compose)。
宣言的UIに慣れ親しんだ身からすると、「やっとAndroidにも来たか...！」という気持ちになるツールキットです。

本記事では、Jetpack Composeをこれから触る人向けに、基本概念とシンプルな画面を作る手順をまとめます。

## Composeとは

ざっくり言うと、***宣言的にUIを構築するためのKotlin DSL***です。
React/Flutterと近い発想で、「状態から画面を導出する」という考え方をします。

- XMLレイアウトが不要になる
- `@Composable`関数を組み合わせてUIを作る
- 状態が変わると、再描画が自動で起きる

## プロジェクトのセットアップ

Android Studio（Flamingo以降推奨）で「Empty Compose Activity」を選ぶのがいちばん手軽です。
手動で設定する場合は`build.gradle.kts`に以下を追加。

```kotlin
android {
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.3"
    }
}

dependencies {
    implementation("androidx.compose.ui:ui:1.5.4")
    implementation("androidx.compose.material3:material3:1.1.2")
    implementation("androidx.activity:activity-compose:1.8.0")
}
```

## 最初のComposable

```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name!")
}
```

`@Composable`アノテーションがついた関数は、Composeの描画対象になります。
Activityからはこう呼び出します。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Greeting("World")
            }
        }
    }
}
```

## レイアウト基本：Column / Row / Box

FlutterでいうColumn/Row/Stackにあたるのがこれら。

```kotlin
@Composable
fun Profile() {
    Column(
        modifier = Modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text("Taisei", style = MaterialTheme.typography.titleLarge)
        Text("Mobile Engineer")
        Row {
            Button(onClick = {}) { Text("Follow") }
            Spacer(Modifier.width(8.dp))
            OutlinedButton(onClick = {}) { Text("Message") }
        }
    }
}
```

`Modifier`を使うと、パディング、背景色、クリック可能化などを**関数チェーン**で適用できます。

## 状態管理：`remember`と`mutableStateOf`

状態を持たせたいときは`remember`と`mutableStateOf`の組み合わせが基本です。

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }

    Column {
        Text("Count: $count")
        Button(onClick = { count++ }) {
            Text("Increment")
        }
    }
}
```

- `mutableStateOf`：値の変更を検知できる`State`を作る
- `remember`：再コンポーズされても値を保持する
- `by`：delegated propertyで`count`を直接扱えるようにする

画面回転などの構成変更でも残したい場合は`rememberSaveable`を使います。

## プレビュー機能

Composeの強みは、AndroidStudioで**即座にプレビューできる**こと。

```kotlin
@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    MaterialTheme {
        Greeting("Preview")
    }
}
```

実機やエミュレータを起動せずに、UI調整が進められるので体験が一段階よくなります。

## Material 3への対応

Android 12以降のDynamic Colorにも、Material 3コンポーネントを使えば比較的簡単に対応できます。

```kotlin
@Composable
fun MyAppTheme(content: @Composable () -> Unit) {
    val context = LocalContext.current
    val colors = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        dynamicLightColorScheme(context)
    } else {
        lightColorScheme()
    }
    MaterialTheme(colorScheme = colors, content = content)
}
```

## おわりに

XMLの山からKotlin DSLへの移行は最初は戸惑いますが、慣れると圧倒的に書くのが楽しくなります。
既存プロジェクトへ段階的に取り入れる場合は`ComposeView`をXMLに埋め込めるので、新規画面から少しずつ移植するのがおすすめです。

## 参考文献

- [Jetpack Compose公式](https://developer.android.com/jetpack/compose)
- [Compose Pathway](https://developer.android.com/courses/pathways/compose)
