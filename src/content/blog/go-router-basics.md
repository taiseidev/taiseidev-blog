---
title: go_routerで始めるFlutterの宣言的ルーティング
description: go_routerの基本的な使い方と、Navigator 1.0 / 2.0の違いを踏まえた宣言的ルーティングの実装方法について解説します。
duration: 15min
date: 2023-2-5
lang: ja-JP
draft: false
category: tech
tag: Flutter, Dart, go_router
---

## はじめに

Flutterのルーティングは長らく***Navigator 1.0***の命令的なAPI（`Navigator.push`など）が主流でしたが、ディープリンクやWeb対応が増えるにつれ、ルート状態をアプリ全体で整合的に扱いたい場面が増えてきました。

そこで登場したのが***Navigator 2.0***（宣言的ルーティング）ですが、そのままではボイラープレートが多く、使いこなすのが難しいという課題がありました。
この課題を解決してくれるのが[go_router](https://pub.dev/packages/go_router)パッケージです。

本記事では、go_routerの基本的な使い方を紹介していきます。

## go_routerとは

go_routerはFlutter公式（flutter.dev）が提供する、宣言的ルーティングを簡潔に書くためのパッケージです。

- URLベースのルート定義
- ディープリンク対応
- ネストされたナビゲーション
- リダイレクト（認証ガード等）

これらが直感的なAPIで書けるようになっています。

## インストール

```yaml
dependencies:
  flutter:
    sdk: flutter
  go_router: ^7.0.0
```

## 最小構成

まずはシンプルなルート定義です。

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

final _router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/detail',
      builder: (context, state) => const DetailPage(),
    ),
  ],
);

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: _router,
    );
  }
}
```

`MaterialApp.router`にGoRouterを渡すだけで準備完了です。

## 画面遷移

画面の遷移は`context.go`や`context.push`を使います。

```dart
// スタックを置き換えて遷移
context.go('/detail');

// スタックに積んで遷移
context.push('/detail');

// 戻る
context.pop();
```

`go`は履歴を置き換え、`push`はスタックに積むのでブラウザの「戻る」ボタンの挙動とも揃えやすくなっています。

## パスパラメータ

詳細画面に`id`を渡したいときはパスパラメータを使います。

```dart
GoRoute(
  path: '/posts/:id',
  builder: (context, state) {
    final id = state.pathParameters['id']!;
    return PostDetailPage(id: id);
  },
),
```

遷移時はこうです。

```dart
context.go('/posts/42');
```

## クエリパラメータ

検索条件などはクエリパラメータが便利です。

```dart
GoRoute(
  path: '/search',
  builder: (context, state) {
    final q = state.uri.queryParameters['q'] ?? '';
    return SearchPage(query: q);
  },
),
```

```dart
context.go('/search?q=flutter');
```

## リダイレクト（認証ガード）

未ログイン時にログイン画面へ飛ばす処理もリダイレクトで一括管理できます。

```dart
final _router = GoRouter(
  redirect: (context, state) {
    final loggedIn = AuthService.instance.isLoggedIn;
    final loggingIn = state.matchedLocation == '/login';

    if (!loggedIn && !loggingIn) return '/login';
    if (loggedIn && loggingIn) return '/';
    return null;
  },
  routes: [ /* ... */ ],
);
```

画面ごとに認証チェックを書かなくて済むのがありがたいところです。

## ShellRouteでボトムナビを実装

タブ切り替え時もルートの状態を保ちたい、というケースは`ShellRoute`で実現できます。

```dart
ShellRoute(
  builder: (context, state, child) {
    return ScaffoldWithNavBar(child: child);
  },
  routes: [
    GoRoute(path: '/home', builder: (_, __) => const HomePage()),
    GoRoute(path: '/settings', builder: (_, __) => const SettingsPage()),
  ],
),
```

各タブのルート履歴を個別に保持したい場合は`StatefulShellRoute`を検討すると良いです。

## エラーハンドリング

ルートが見つからない場合のフォールバックも設定できます。

```dart
GoRouter(
  errorBuilder: (context, state) => NotFoundPage(error: state.error),
  routes: [ /* ... */ ],
);
```

## おわりに

go_routerは宣言的ルーティングを格段に書きやすくしてくれるパッケージです。
個人的にはディープリンクやWeb対応のしやすさが大きく、小規模〜中規模のアプリでも十分メリットを感じます。

まだ使ったことがない方は、ぜひ一度試してみてください！

## 参考文献

- [go_router](https://pub.dev/packages/go_router)
- [Flutterのルーティングを宣言的に扱う](https://docs.flutter.dev/ui/navigation)
