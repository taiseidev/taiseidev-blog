---
title: FlutterのAnimationControllerを使いこなす
description: Flutterのアニメーションの基礎となるAnimationControllerの使い方を、実例を交えながら解説します。
duration: 15min
date: 2023-5-20
lang: ja-JP
draft: false
category: tech
tag: Flutter, Dart, Animation
---

## はじめに

Flutterでリッチなアニメーションを作る場合、避けて通れないのが***AnimationController***です。
Tweenアニメーションのパッケージに頼ってしまえばそれなりに楽ではあるのですが、AnimationControllerの仕組みを理解しておくと、独自アニメーションの自由度がぐっと上がります。

本記事では、AnimationControllerの基本と、よく使うパターンを紹介していきます。

## AnimationControllerとは

- アニメーションの「再生・停止・リセット」などを制御するクラス
- 値は `0.0 〜 1.0` で変化し、`duration`の時間をかけて進行する
- `TickerProvider`（通常は`SingleTickerProviderStateMixin`）が必要

まずはシンプルな例から。

## 基本的な使い方

フェードイン/アウトするボックスを作ってみます。

```dart
class FadeBox extends StatefulWidget {
  @override
  State<FadeBox> createState() => _FadeBoxState();
}

class _FadeBoxState extends State<FadeBox>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller,
      child: Container(
        width: 100,
        height: 100,
        color: Colors.deepPurple,
      ),
    );
  }
}
```

ポイントは3つ。

1. `vsync: this`でTickerを渡す（画面がオフの時にアニメーションを止めるため）
2. `dispose`でControllerを破棄する（メモリリーク防止）
3. `FadeTransition`などのBuilt-inトランジションに渡すだけで動く

## Tweenで値の範囲を変える

AnimationControllerの値は0.0〜1.0ですが、`Tween`を使えば任意の範囲に変換できます。

```dart
final _scale = Tween<double>(begin: 0.5, end: 1.5).animate(_controller);

ScaleTransition(
  scale: _scale,
  child: const FlutterLogo(size: 80),
);
```

色を変化させるなら`ColorTween`。

```dart
final _color = ColorTween(begin: Colors.red, end: Colors.blue)
    .animate(_controller);

AnimatedBuilder(
  animation: _color,
  builder: (_, __) => Container(color: _color.value, width: 80, height: 80),
);
```

## Curvesで動きに個性を出す

直線的な動きだけでは味気ないので、`CurvedAnimation`を使って緩急をつけます。

```dart
final curve = CurvedAnimation(
  parent: _controller,
  curve: Curves.easeInOutCubic,
);

final _opacity = Tween<double>(begin: 0, end: 1).animate(curve);
```

よく使うCurvesは以下あたり。

| Curve | 特徴 |
|---|---|
| `Curves.easeIn` | 始まりゆっくり |
| `Curves.easeOut` | 終わりゆっくり |
| `Curves.easeInOut` | 両端ゆっくり |
| `Curves.bounceOut` | 跳ねる |
| `Curves.elasticOut` | ぴょんと跳ねる |

## アニメーションの制御メソッド

```dart
_controller.forward();      // 0→1 へ進める
_controller.reverse();      // 1→0 へ戻す
_controller.stop();         // 一時停止
_controller.reset();        // 0 に戻す
_controller.repeat();       // 繰り返し
_controller.repeat(reverse: true); // 往復
_controller.animateTo(0.5); // 任意の値へ
```

## 複数のアニメーションを合成する

複雑なアニメーションを作るときは、1つのAnimationControllerから複数のTweenを派生させると管理が楽です。

```dart
// 前半でフェードイン、後半でスケールアップ
final _fade = Tween<double>(begin: 0, end: 1).animate(
  CurvedAnimation(
    parent: _controller,
    curve: const Interval(0.0, 0.5),
  ),
);

final _scale = Tween<double>(begin: 0.8, end: 1.0).animate(
  CurvedAnimation(
    parent: _controller,
    curve: const Interval(0.5, 1.0, curve: Curves.easeOut),
  ),
);
```

`Interval`を使うと「0〜0.5の区間でフェード」「0.5〜1.0の区間でスケール」のようにタイミングを指定できます。

## AnimatedBuilder vs ImplicitlyAnimatedWidget

Flutterには暗黙的アニメーションWidget（`AnimatedContainer`、`AnimatedOpacity`など）もあります。
ざっくりの使い分けはこのイメージ。

- **単発・プロパティ1つ**：`AnimatedContainer`など暗黙的Widgetで十分
- **繰り返し・複雑な動き**：AnimationControllerを使う

## おわりに

AnimationControllerは最初こそ取っつきにくいですが、一度理解してしまえば自由自在にUIを動かせるようになります。
特に、`Interval`で複数のアニメーションを組み合わせる方法を覚えるとかなり表現の幅が広がるので、ぜひ試してみてください。

## 参考文献

- [Flutter公式 Animations](https://docs.flutter.dev/ui/animations)
- [AnimationController class](https://api.flutter.dev/flutter/animation/AnimationController-class.html)
