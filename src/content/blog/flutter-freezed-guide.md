---
title: Flutterのfreezedでイミュータブルなデータクラスを扱う
description: Dart/Flutterでイミュータブルなデータクラスを書くためのパッケージ「freezed」の基本的な使い方をまとめます。
duration: 12min
date: 2023-3-12
lang: ja-JP
draft: false
category: tech
tag: Flutter, Dart, freezed
---

## はじめに

Dartには標準でイミュータブルなデータクラスを簡潔に書く仕組みがありません。
自分で`copyWith`や`==`、`hashCode`、`toString`を書こうとすると、ボイラープレートが膨大になりがちです。

そこで登場するのが[freezed](https://pub.dev/packages/freezed)です。
コード生成によって、上記をすべて自動で用意してくれます。

本記事では、freezedの基本的な使い方とよくあるハマりどころを紹介します。

## インストール

```yaml
dependencies:
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1

dev_dependencies:
  build_runner: ^2.4.6
  freezed: ^2.4.5
  json_serializable: ^6.7.1
```

パッケージを追加したら、`build_runner`でコード生成を実行します。

```bash
dart run build_runner watch --delete-conflicting-outputs
```

`watch`にしておくと、ファイルの変更を検知して自動生成してくれるので便利です。

## 基本的な使い方

シンプルなユーザークラスを例に見てみます。

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String name,
    int? age,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
```

これだけで、以下の機能が自動的に生成されます。

- `copyWith`
- `==` と `hashCode`
- `toString`
- `fromJson` / `toJson`

### copyWithの使用例

```dart
final user = User(id: '1', name: 'Alice');
final updated = user.copyWith(name: 'Alicia');
```

ミュータブルにしないとフィールドを更新できないという悩みが解消されます。

## Unionによる状態表現

freezedの強力な機能のひとつがUnion型です。
たとえばAPIの結果を表現したいとき、こんなふうに書けます。

```dart
@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(String message) = Failure<T>;
}
```

使う側ではパターンマッチングで分岐できます。

```dart
result.when(
  success: (data) => print('OK: $data'),
  failure: (msg)  => print('NG: $msg'),
);
```

`when`は全パターンを漏らさず扱うように強制されるので、バグが起きづらくなります。
ローディング状態を追加するならこう。

```dart
@freezed
class AsyncState<T> with _$AsyncState<T> {
  const factory AsyncState.loading() = _Loading<T>;
  const factory AsyncState.data(T value) = _Data<T>;
  const factory AsyncState.error(Object error) = _Error<T>;
}
```

## よくあるハマりどころ

### 1. `part`宣言を忘れる

```dart
part 'user.freezed.dart';
part 'user.g.dart'; // fromJson/toJsonを使うときだけ必要
```

`freezed`は`.freezed.dart`を生成し、`json_serializable`は`.g.dart`を生成します。
どちらも`part`宣言が必要です。

### 2. `const factory`にし忘れる

`const factory`にしておくことで、コンパイル時定数として扱えます。
基本はすべて`const factory`でOKです。

### 3. カスタムメソッドを書きたい

メソッドを追加したい場合はプライベートコンストラクタを使います。

```dart
@freezed
class User with _$User {
  const User._();

  const factory User({
    required String id,
    required String name,
  }) = _User;

  String greeting() => 'Hello, $name!';
}
```

`const User._();`がないとカスタムメソッドを定義できないので注意です。

## おわりに

freezedを使えば、Dartでも安全で簡潔にイミュータブルなクラスを扱えます。
個人的にはRiverpodと組み合わせて状態管理する時にも非常に相性が良く、Flutterプロジェクトには欠かせないパッケージになっています。

## 参考文献

- [freezed](https://pub.dev/packages/freezed)
- [Flutter freezed のチートシート](https://zenn.dev/sakusin/articles/b19e9a2c3829e0)
