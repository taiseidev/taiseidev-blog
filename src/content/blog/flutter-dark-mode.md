---
title: Flutterでダークモードをスマートに実装する
description: FlutterのThemeDataを使ってダークモードを実装する方法と、ユーザーが手動でテーマを切り替えられるようにする仕組みを紹介します。
duration: 12min
date: 2023-4-8
lang: ja-JP
draft: false
category: tech
tag: Flutter, Dart, Theme
---

## はじめに

スマートフォンユーザーにとって、ダークモードはもはや標準機能のひとつ。
Flutterはこれを非常にスマートに扱える仕組みを持っています。

本記事では、以下の2点をコンパクトにまとめます。

1. OSの設定にあわせてダーク/ライトを自動で切り替える
2. アプリ内でユーザーが手動で切り替えられるようにする

## OS設定に追従させる

もっともシンプルな実装は、`MaterialApp`に`theme`と`darkTheme`を渡すことです。

```dart
MaterialApp(
  theme: ThemeData.light(useMaterial3: true),
  darkTheme: ThemeData.dark(useMaterial3: true),
  themeMode: ThemeMode.system, // OSの設定に従う
  home: const HomePage(),
);
```

`themeMode`には次の3つが指定できます。

| 値 | 挙動 |
|---|---|
| `ThemeMode.system` | OS設定に追従（既定） |
| `ThemeMode.light` | 常にライト |
| `ThemeMode.dark` | 常にダーク |

## カスタムテーマの定義

単に`ThemeData.light()`を使うだけでなく、色やフォントもカスタマイズしておくとアプリの個性が出ます。

```dart
final lightTheme = ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: Colors.indigo,
    brightness: Brightness.light,
  ),
  textTheme: const TextTheme(
    bodyMedium: TextStyle(fontFamily: 'NotoSansJP'),
  ),
);

final darkTheme = ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: Colors.indigo,
    brightness: Brightness.dark,
  ),
);
```

`ColorScheme.fromSeed`は1色指定するだけで、Material 3基準のカラーパレットを自動生成してくれる優れものです。

## ユーザーが手動で切り替えられるようにする

OS設定に追従するだけでなく、アプリ内で切り替えたいケースも多いと思います。
ここではシンプルに`ValueNotifier`で実装してみます（Riverpodやbloc、好きな状態管理ツールに置き換えてOK）。

```dart
final themeModeNotifier = ValueNotifier<ThemeMode>(ThemeMode.system);

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeModeNotifier,
      builder: (_, mode, __) {
        return MaterialApp(
          theme: lightTheme,
          darkTheme: darkTheme,
          themeMode: mode,
          home: const HomePage(),
        );
      },
    );
  }
}
```

切り替え用のトグルをどこかに置きます。

```dart
Switch(
  value: themeModeNotifier.value == ThemeMode.dark,
  onChanged: (isDark) {
    themeModeNotifier.value =
        isDark ? ThemeMode.dark : ThemeMode.light;
  },
);
```

## 永続化する

ユーザーが選んだテーマを記憶させたい場合は`shared_preferences`などで永続化します。

```dart
Future<void> saveThemeMode(ThemeMode mode) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('themeMode', mode.name);
}

Future<ThemeMode> loadThemeMode() async {
  final prefs = await SharedPreferences.getInstance();
  final value = prefs.getString('themeMode') ?? 'system';
  return ThemeMode.values.firstWhere((m) => m.name == value);
}
```

アプリ起動時に`loadThemeMode`を呼び出して、`themeModeNotifier`の初期値にするだけで完成です。

## 現在のテーマを判定する

Widgetの中で現在がダークモードかどうかを判定するときは`Theme.of(context).brightness`を使います。

```dart
final isDark = Theme.of(context).brightness == Brightness.dark;
```

画像やアイコンの差し替えに使えます。

## おわりに

Flutterのテーマシステムは本当によくできていて、`themeMode`の一行だけでダークモード対応が始められます。
個人的には、最初から`ColorScheme.fromSeed`を使って色を一元管理しておくと、後からの変更にも強くなるのでおすすめです。

## 参考文献

- [Material 3 in Flutter](https://docs.flutter.dev/ui/design/material)
- [ColorScheme.fromSeed](https://api.flutter.dev/flutter/material/ColorScheme/ColorScheme.fromSeed.html)
