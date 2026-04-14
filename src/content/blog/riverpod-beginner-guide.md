---
title: Riverpodを学んで初学者の壁をぶち破る
description: Riverpodの基本的な使い方を学び、Flutterでの状態管理の理解を深める。サンプルアプリを作成し、Riverpod 2.0の新機能も紹介。
duration: 30min
date: 2023-6-7
lang: ja-JP
draft: false
category: tech
tag: Flutter, Dart, Riverpod
image:
  src: "/ogp/riverpod-beginner-guide.png"
  alt: "riverpod-beginner-guide"
---

## はじめに

2022年12月1日、ついにRiverpodがFlutter公式の動画で紹介されました🚀

[X - post by @FlutterDev](https://twitter.com/FlutterDev/status/1598074394181599262?s=20&t=xzavpqI2zE0U4vT-i8w7vA)

Flutter公式の「***List of state management approaches***」でもRiverpodが紹介されています！
これまではRiverpodの前身のProviderパッケージがFlutter公式推奨として紹介されていましたが、ついにRiverpodも公式推奨となりました✨

[riverpod](https://docs.flutter.dev/development/data-and-backend/state-mgmt/options#riverpod)

日本では既に様々なプロジェクトでRiverpodが採用されていると思いますが、
Flutter公式が推奨することによりさらにRiverpodの人気が世界中で高まっていく事が予想されます🚀

今回は公式推奨になった記念にRiverpodを学んで初学者を脱しようという内容です。
私自身もまだ十分に理解できていないなと感じるので、誤っている部分がありましたらコメントをいただけますと幸いです🙏

## 記事の目的と対象者

この記事を読むことによってRiverpodの基本的な使い方を習得する事を目的にしたいと思います。サンプルアプリを一緒に作りながらRiverpodを学んでいく形です。そのため、この記事では下記の方を対象にしています。

・これからRiverpodを学ぶ方
・Riverpodの使い方に不安を感じている方（私です）

（基礎的な使い方を押さえている方には少々物足りないかもしれません）

また、記事の後半では2022年9月にリリースされたRiverpod2.0についても解説していきたいと思います。
Riverpod2.0をキャッチアップはまだだよ〜って方にも読んでいただけると嬉しいです！

今回作成したサンプルアプリは下記から確認する事が出来ます。

[riverpod-sample](https://github.com/taiseidev/riverpod-sample)

では、解説していきます🚀

## 目次

[1.Riverpodの概要](https://qiita.com/drafts/4c9d9572a56051a1d51f/edit#riverpod%E3%81%AE%E6%A6%82%E8%A6%81)<br>
[2.実際に使ってみよう](https://qiita.com/drafts/4c9d9572a56051a1d51f/edit#%E5%AE%9F%E9%9A%9B%E3%81%AB%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86)<br>
[3.Riverpod2.0](https://qiita.com/drafts/4c9d9572a56051a1d51f/edit#riverpod20)

# Riverpodの概要

Riverpodとは、状態管理パッケージとして主流だったProviderパッケージを進化させる形で開発された、リアクティブなキャッシュとデータバインディングの状態管理パッケージです。

> **本記事の注意点：**
> 「Provider」という文言がややこしいので、Riverpodの前身を「***Providerパッケージ***」とし、RiverpodとProviderパッケージで使われるProviderを「***Provider***とします。

では、Riverpodで何が進化したかを学ぶためにも、Providerパッケージの主な欠点を確認していきましょう！

ProviderパッケージはInheritedWidgetを改良する形で開発されたパッケージでWidgetツリーに依存します。

<img src='https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2466417/31dce8f1-7ab4-ae32-5812-20d14eda2560.png' width='300'>

(画像は[Flutter Riverpod 2.0: The Ultimate Guide](https://codewithandrea.com/articles/flutter-state-management-riverpod/)からお借りしました)

画像のように、親のWidgetツリーを見て登録されているProviderにアクセスする事が出来ます。裏を返すと親のWidgetツリーには使用したいProviderが登録されている必要があるため、もしProviderが登録がされていない場合は***ProviderNotFoundException***エラーが発生してしまいます。

> 実際にサンプルアプリでも***ProviderNotFoundException***を発生させるサンプルを作成してみました。
確認したい方は***provider_package***ディレクトリ***main()***からアプリを起動させてみてください！

一方でRiverpodは、ProviderをWidgetツリーから切り離してグローバルに定義する事が出来るため、定義したProviderに確実にアクセスする事が出来ます🚀

<img src='https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2466417/c90674be-a885-569b-d20c-4b1e46d1530f.png' width='300'>

(画像は[flutter-study.dev](https://www.flutter-study.dev/firebase-app/riverpod)からお借りしました)

そのほかにも、Providerパッケージでは同じ型のものが複数同時に使用できない（Widgetツリー直近で指定された型が取得される）のに対して、Riverpodでは同じ型のProviderを複数参照できるなどProviderパッケージの欠点を補ってくれます。

そのほかにもRiverpodのメリットは沢山ありますが、全て書いてると長くなりそうなので下記の記事をご覧ください🙇‍♂️

[Flutterの状態管理手法の選定](https://medium.com/flutter-jp/state-1daa7fd66b94)

## 実際に使ってみよう

では実際にRiverpodを学んでいきましょう🔥

### 1. Riverpodをインストール

Riverpodは複数のパッケージがあり、それぞれ用途が異なります。

|アプリの形態  |パッケージ名  |説明  |
|---|---|---|
|Flutterのみ  |[flutter_riverpod](https://pub.dev/packages/flutter_riverpod)  |FlutterアプリでRiverpodを使用する場合の基本パッケージ  |
|Flutter + [flutter_hooks](https://github.com/rrousselGit/flutter_hooks)  |[hooks_riverpod](https://pub.dev/packages/hooks_riverpod)  |flutter_hooksとRiverpodを併用する場合のパッケージ  |
|Darthのみ（Flutterを使用しない）  |[riverpod](https://github.com/rrousselGit/riverpod/tree/master/packages/riverpod)  |Flutter関連のクラスを全て除いたRiverpodパッケージ  |

今回はFlutterで基本的なRiverpodの使い方を解説するだけなのでhooks_riverpodやriverpodは解説しません。flutter_riverpodのみを使用します。

pubspec.yamlに下記を追加してインストールします。

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.1.1 // 追加
```

次に***ProviderScope***でアプリ全体をラップします

```dart
void main() {
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}
```

ProviderScopeは作成したすべてのProviderの状態を保存してくれるWidgetです。

以上でRiverpodを使う準備が整いました🚀

### 2. サンプルアプリを作ろう

今回作るアプリはQiitaのAPIを使ってタグで投稿を検索アプリを作成します。

[GET /api/v2/tags/:tag_id/items](https://qiita.com/api/v2/docs#get-apiv2tagstag_iditems)

アーキテクチャ（ディレクトリ構成）は下記を参考にさせていただいています。

[flutter-architecture-blueprints](https://github.com/wasabeef/flutter-architecture-blueprints)

**今回作るアプリ**

<img src='https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2466417/d90fc4d3-78ec-8b2f-0a24-7552a8d582ac.gif' width='300'>

では作っていきます。

### ①データクラスを作成

本旨ではないのでパパッと解説していきます。
API通信を行い、Jsonで返却されるデータをアプリで使える形に変換してあげる必要があります。下記のパッケージを用いてデータクラスを作成します。

```yaml
dependencies:
  flutter:
    sdk: flutter
  freezed: ^2.3.0
  freezed_annotation: ^2.2.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.3.2
  json_serializable: ^6.5.4
```

作成したデータクラスは下記の通りです。

<details>
<summary>qiita_post.dart</summary>

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:riverpod_sample/riverpod/data/models/tag.dart';
import 'package:riverpod_sample/riverpod/data/models/user.dart';

part 'qiita_post.freezed.dart';
part 'qiita_post.g.dart';

@freezed
abstract class QiitaPost with _$QiitaPost {
  factory QiitaPost({
    String? title,
    @JsonKey(name: 'likes_count') int? likesCount,
    @JsonKey(name: 'stocks_count') int? stocksCount,
    User? user,
    String? url,
    List<Tag>? tags,
  }) = _QiitaPost;

  factory QiitaPost.fromJson(Map<String, dynamic> json) =>
      _$QiitaPostFromJson(json);
}
```

</details>

<details>
<summary>tag.dart</summary>

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'tag.freezed.dart';
part 'tag.g.dart';

@freezed
abstract class Tag with _$Tag {
  factory Tag({
    String? name,
  }) = _Tag;

  factory Tag.fromJson(Map<String, dynamic> json) => _$TagFromJson(json);
}
```

</details>

<details>
<summary>user.dart</summary>

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
abstract class User with _$User {
  factory User({
    @JsonKey(name: 'profile_image_url') String? profileImageUrl,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

```

</details>

freezedを使ったデータクラスの作成については下記が参考になります。

[Flutter freezed のチートシート、もとい、知っている人向けのメモ](https://zenn.dev/sakusin/articles/b19e9a2c3829e0)

### ②APIクライアントの実装

今回API通信はretrofitを使います。下記パッケージをインストールしてください。

```yaml
dependencies:
  flutter:
    sdk: flutter
  retrofit: ^3.3.1
  dio: ^4.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  retrofit_generator: ^4.2.0
```

パッケージをインストールしたらAPI通信を行う抽象クラスを作成します。

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:retrofit/retrofit.dart';
import 'package:dio/dio.dart';
import 'package:riverpod_sample/riverpod/data/models/qiita_post.dart';
import 'package:riverpod_sample/riverpod/data/remote/app_dio.dart';

part 'posts_data_source.g.dart';

final postsDataSourceProvider = Provider<PostsDataSource>((ref) {
  return PostsDataSource(
    ref.watch(dioProvider),
  );
});

@RestApi(baseUrl: "https://qiita.com/api/v2")
abstract class PostsDataSource implements IPostsDataSource {
  factory PostsDataSource(Dio dio, {String baseUrl}) = _PostsDataSource;

  @override
  @GET("/tags/{tag}/items")
  Future<List<QiitaPost>> getQiitaPosts(
    @Path("tag") String tag,
    @Query("per_page") int perPage,
  );
}

```

retrofitはメソッド（@GET）、エンドポイント、パスやクエリを定義するだけでAPIクライアントの実体を生成してくれる便利なパッケージです。***IPostsDataSource***を継承している部分は後ほど説明します。
抽象クラスの作成が終わったらターミナルで下記コマンドを実行

```terminal
flutter pub run build_runner watch --delete-conflicting-outputs
```

***posts_data_source.g.dart***ファイルが自動で生成されます。

ここでやっとRiverpodのProviderが出てきたので解説します。

```dart
final postsDataSourceProvider = Provider<PostsDataSource>((ref) {
  return PostsDataSource(
    ref.read(dioProvider),
  );
});
```

ここでは***Provider***を使ってPostsDataSourceのインスタンスを公開しています。***Provider***は変更できない値を公開できるProvider群の一つで、今回のようにAPIクライアントやRepositoryクラスを公開する時などに役立ちます。

また、PostsDataSourceの引数にDioのインスタンスを返却するdioProviderを渡しています。こういったDioのインスタンスのように複数インスタンスを作る必要がないものをProviderで公開することによって使い回しやすくなります。こういった点もRiverpodのメリットかなと思います。

dioProviderではHTTP通信を行った際にログを出力するコードを追加しています。

```dart
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final dioProvider = Provider<Dio>((_) {
  final dio = Dio();
  dio.interceptors.add(LogInterceptor()); // ←を追加することによってコンソールにログが出力されます。
  return dio;
});
```

Providerについてのもっと詳しく知りたい方は公式ドキュメントを参照ください。

[Provider](https://riverpod.dev/ja/docs/providers/provider)

### ③Repositoryを作成

次にDataSourceにアクセスするためのRepositoryを作成します。

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_sample/riverpod/data/i_posts_data_source.dart';
import 'package:riverpod_sample/riverpod/data/models/qiita_post.dart';
import 'package:riverpod_sample/riverpod/data/models/result.dart';
import 'package:riverpod_sample/riverpod/data/remote/posts_data_source.dart';

final postsRepositoryProvider =
    Provider((ref) => PostsRepository(ref.read(dataSourceProvider)));

final dataSourceProvider =
    Provider<IPostsDataSource>((ref) => throw UnimplementedError());

class PostsRepository {
  PostsRepository(this._dataSource);

  final IPostsDataSource _dataSource;

  static const defaultPostCount = 50;

  Future<Result<List<QiitaPost>>> getQiitaPosts(
    String tag,
    int defaultPostCount,
  ) {
    return _dataSource
        .getQiitaPosts(tag, defaultPostCount)
        .then((articles) => Result<List<QiitaPost>>.success(articles))
        .catchError((error) => Result<List<QiitaPost>>.failure(error));
  }
}

```

ここではRiverpodのDI機能を活用してDataSourceの差し替えを行なっています。
あらかじめダミーデータを取得するためのStubPostsDataSourceを作成。

```dart
import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_sample/riverpod/data/i_posts_data_source.dart';
import 'package:riverpod_sample/riverpod/data/models/qiita_post.dart';

final stubPostsDataSourceProvider = Provider<StubPostsDataSource>((ref) {
  return StubPostsDataSource();
});

class StubPostsDataSource implements IPostsDataSource {
  // dammy_data.jsonにダミーデータが入っているのでそれを非同期で取得
  @override
  Future<List<QiitaPost>> getQiitaPosts(String tag, int perPage) async {
    final content =
        json.decode(await rootBundle.loadString('assets/stub/dammy_data.json'))
            as Iterable;
    return content.map((e) => QiitaPost.fromJson(e)).toList();
  }
}

```

API通信を行う***PostsDataSource***とローカルのダミーデータを取得する***StubPostsDataSource***は、抽象クラスである***IPostsDataSource***を継承しているのでどちらもコンストラクタで渡す事が可能です。

```dart
import 'package:riverpod_sample/riverpod/data/models/qiita_post.dart';

abstract class IPostsDataSource {
  Future<List<QiitaPost>> getQiitaPosts(String tag, int perPage);
}
```

> Dartでは「暗黙的インターフェース」を活用することによって、明示的にインターフェースを定義しなくても別クラスが別クラスをインターフェイスとして実装することが可能です。
今回の場合ですと、***i_posts_data_source.dart***を削除して、***StubPostsDataSource***が実装しているIPostsDataSourceをAPIクライアントの ***PostsDataSource***に換えてあげれば完了です🙆‍♂️
インターフェースを定義する必要がなくなるので、クラスを差し替えるだけであれば「暗黙的インターフェース」をうまく活用した方が良さそうですね。

[Implicit interfaces](https://dart.dev/language/classes#implicit-interfaces)

Repositoryでは***PostsRepository***の引数にIPostsDataSourceを返す***dataSourceProvider***を渡す形で実装しています。
しかし、***dataSourceProvider***はデフォルトで未実装のエラー（UnimplementedError）を投げるようにしているためどこかでoverrideしてあげる必要があります。
どこでoverrideしてあげるかというと、***main.dart***のProviderScope内で行います。

```dart
void main() {
  runApp(
    ProviderScope(
      overrides: [
// ここを差し替えることによってAPI通信を行うか、ダミーデータを取得するか変更する事ができる。
        dataSourceProvider
            .overrideWith(((ref) => ref.watch(stubPostsDataSourceProvider))),
      ],
      child: QiitaApp(),
    ),
  );
}

```

これでAPI通信を行うか、ダミーデータを取得するかを***main.dart***で簡単に変更する事が出来るようになりました！

> ***overrideWithProvider***というメソッドもありますが現在は非推奨となっています。
代わりに今回サンプルで使用したのと同じ***overrideWith***を使用してください。

### ④ViewModelを作成

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_sample/riverpod/data/models/qiita_post.dart';
import 'package:riverpod_sample/riverpod/data/repository/posts_repository.dart';

// エラーメッセージを管理。isNotEmptyになったらViewのref.listenのコールバックが発火してダイアログ表示
final errorMessageProvider = StateProvider<String>((_) => '');
// 現在のタグを管理
final tagProvider = StateProvider<String>((_) => 'Flutter');

// autoDisposeをつけることによってこのProviderが参照されなくなったらProviderを破棄してくれます。
final postsViewModelProvider = FutureProvider.autoDispose<List<QiitaPost>>(
  (ref) async {
    final posts = await ref
        .watch(postsRepositoryProvider)
        .getQiitaPosts(ref.watch(tagProvider), 50);
// Resultクラスを作って成功時と失敗時の処理を変えています。
// Resultクラスの説明は時間がないので割愛..
    return posts.when(
      success: (value) => value,
      failure: (error) {
        ref
            .read(errorMessageProvider.notifier)
            .update((state) => state = error.response!.statusCode.toString());
        return [];
      },
    );
  },
);

```

ViewModelは***FutureProvider***を使って実装しています。***FutureProvider***は非同期操作が可能なProviderで、戻り値が***AsyncValue***という特殊な型になっています。このAsyncValueを使ってView側ではデータ取得時、エラー時、ローディング時に表示させるWidgetを自動的に切り替えています。
（最初使った時結構感動しました）

```dart
Widget build(BuildContext context, WidgetRef ref) {
  final posts = ref.watch(postsViewModelProvider); // AsyncValue型
// 省略
  return posts.when(
    loading: () => const CircularProgressIndicator(),
    error: (err, stack) => Text('Error: $err'),
    data: (posts) {
// データ取得時に表示するWidgetを返却
    },
  );
}
```

AsyncValueについては下記の記事が参考になります。

[Riverpod v2のAsyncValueを理解する](https://zenn.dev/tsuruo/articles/52f62fc78df6d5)

### ⑤Viewを作成

Viewは一部抜粋して解説していきます。

```dart
// StatelessWidgetをConsumerWidgetに変更
class PostsPage extends ConsumerWidget {
  const PostsPage({super.key});

  static const primaryColor = Color(0xff59bb0c);
  static const defaultTag = 'TypeScript';

  @override
  Widget build(BuildContext context, WidgetRef ref) { // WidgetRefを追加
    final posts = ref.watch(postsViewModelProvider);
    final controller = ref.watch(textEditingControllerProvider);
// 省略
```

ViewでProviderにアクセスする場合は下記の変更が必要です。

**1. StatelessWidgetをConsumerWidgetに書き換える**
**2. buildメソッドの引数にWidgetRefを追加**

これでViewでProviderにアクセスする事ができます。

```dart
    ref.listen<String>(
      errorMessageProvider,
      ((previous, next) {
        if (next == '403') {
          errorDialog('検索できないよ😡');
        }
        if (next == '404') {
          errorDialog('投稿が見つかりません😢');
        }
      }),
    );
// 省略
```

buildメソッド内に***ref.listen***というものを使っていますが、こちらもRiverpodの機能の一つです。
***ref.listen***はプロバイダの値を監視し、値が変化するたびに第二引数に指定したコールバックが発火します。今回はerrorMessageProviderを監視して、エラーメッセージが入ったらダイアログが表示される形で実装しています。

<img src='https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2466417/ee32cf0b-0e86-87d1-b11f-13711da199f5.gif' width='350'>

駆け足になってしまいましたが、一旦QiitaのAPIを使って投稿を取得するアプリの完成です🚀🚀

<img src='https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2466417/bd26d509-f4df-fdad-84fc-e6593b79e19d.gif' width='350'>

## Riverpod2.0

ここからは8/31,9/1に開催されたFlutterVikingsで発表されたRiverpod2.0について勉強していきましょう！

<iframe width="560" height="315" src="https://www.youtube.com/embed/C2Zp731g8Es?si=zhdQ7TYo5_X7E0H7" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Riverpod2.0のポイントは下記の二つです。

**1. riverpod_generatorの登場**
**2. NotifierとAsyncNotifier**

### 1. riverpod_generator

本記事では全てをカバーしていませんが、Riverpodは6種類のProviderが用意されています。

|プロバイダの種類|生成されるステートの型|具体例|
|-----------------------------|--------------------------|----------------------------------|
|Provider|任意|サービスクラス / 算出プロパティ（リストのフィルタなど|
|StateProvider|任意|フィルタの条件 / シンプルなステートオブジェクト|
|FutureProvider|任意のFuture| API の呼び出し結果|
|StreamProvider|任意のStream| API の呼び出し結果の Stream|
|StateNotifierProvider|StateNotifierのサブクラス|イミュータブル（インタフェースを介さない限り）で複雑なステートオブジェクト|
|ChangeNotifierProvider|ChangeNotifierのサブクラス|ミュータブルで複雑なステートオブジェクト|

どのProviderを使うべきか悩みますよね？
そんな悩みをriverpod_generatorを使えば解決してくれるかもしれません！

[riverpod-generator](https://pub.dev/packages/riverpod_generator)

**パッケージを追加**
riverpod_generatorを使用するために下記のパッケージを追加

```yaml
dependencies:
  riverpod_annotation: ^1.0.6

dev_dependencies:
  riverpod_generator: ^1.0.6
```

Dioのインスタンスを返すProviderをriverpod_generatorを使って書き換えてみます。

```dart
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final dioProvider = Provider<Dio>((_) {
  final dio = Dio();
  dio.interceptors.add(LogInterceptor());
  return dio;
});

```

↓新しい構文

```dart
import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_dio.g.dart'; // 自動生成ファイルを定義

@riverpod // riverpod_annotationをimportして@riverpodを追加
Dio dio(DioRef ref) {
  final dio = Dio();
  dio.interceptors.add(LogInterceptor());
  return dio;
}
```

書き換えたらbuild_runnerを実行

```terminal
flutter packages pub run build_runner build --delete-conflicting-outputs
```

app_dio.g.dartファイルが生成されました！

![スクリーンショット 2022-12-08 4.39.42.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2466417/98b60ddb-7e96-8dab-7360-83bd1440ef2a.png)

```dart
// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_dio.dart';

// 省略

/// See also [dio].
final dioProvider = AutoDisposeProvider<Dio>(
  dio,
  name: r'dioProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : $dioHash,
);
typedef DioRef = AutoDisposeProviderRef<Dio>;

```

自動生成ファイルでは下記の定義がされています。
・Providerの生成
・引数に渡されるDioRefの型定義

また、riverpod_generatarを使用するとデフォルトでautoDispose修飾子がついたProviderが生成されるようになっています。

> 「Providerへの参照がなくなっても状態を保持したいのにriverpod_generatorを使うとデフォルトでautoDisposeされてしまう.... 」とお困りの方もいるかもしれません。そんな方は***keepAlive***を使う事で解決します。

```dart
// keepAlive: trueにすることでアプリがkillされない限り状態が保持される
@Riverpod(keepAlive: true)
Future<Post> fetchPost(FetchPostRef ref, int postId) {
  print('init: fetchPost($postId)');
  ref.onDispose(() => print('dispose: fetchPost($postId)'));
  return ref.watch(postsRepositoryProvider).fetchPost(postId);
}
```

詳しくは下記をご覧ください。
[How does keepAlive work?
](https://codewithandrea.com/articles/flutter-riverpod-data-caching-providers-lifecycle/#how-does-keepalive-work?)
:::

今回作成したサンプルアプリでは使用していないですが、riverpod_generatorを使うことによってfamily修飾子の欠点を補ってくれます。
例えばfamily修飾子を使用して次のようなFutureProviderを作ったとします。

```dart
// postIDから該当のpostデータを取得するProvider
final postProvider = FutureProvider.autoDispose
    .family<Post, int>((ref, postId) {
  return ref
      .watch(postRepositoryProvider)
      .post(postId: postId);
});
```

famliy修飾子を追記することによってProviderにパラメーターを渡す事ができますが、複数のパラメーターを渡す事ができません。
（正しくはtupleパッケージを使用するなど工夫しないと複数のパラメーターを渡す事ができない）
これをriverpod_generatorを使って書き換えると次のようになります。

```dart
@riverpod
Future<Post> post(
  PostRef ref, {
  required int postId,
  required String postType
// 名前付きで複数のパラメーターを渡す事ができる
}) {
  return ref
      .watch(postRepositoryProvider)
      .post(postId: postId, type: postType);
}
```

このようにriverpod_generatorを使うことによって複数のパラメーターを渡す事が出来るようになりました！

View側では名前付きで値を渡す事ができます。

```dart
final asyncValue = ref.watch(postProvider(postId: 0, type: ''));
```

riverpod_generatorのおかげでますますRiverpodが使いやすくなりましたね！

> **注意点:**
> riverpod_generatorは現在2種類のProviderしかサポートされていません。
**・Provider**
**・FutureProvider**

今回はRiverpodを使ったサンプルアプリの実装とRiverpod2.0について書いてみました！

## 参考文献

[Flutter Riverpod 2.0: The Ultimate Guide](https://codewithandrea.com/articles/flutter-state-management-riverpod/)

[flutter-riverpod-generator](https://codewithandrea.com/articles/flutter-riverpod-generator/)

[flutter-riverpod-async-notifier](https://codewithandrea.com/articles/flutter-riverpod-async-notifier/)

[unit-test-async-notifier-riverpod](https://codewithandrea.com/articles/unit-test-async-notifier-riverpod/)

[flutter-riverpod-data-caching-providers-lifecycle](https://codewithandrea.com/articles/flutter-riverpod-data-caching-providers-lifecycle/)

[Flutterの状態管理手法の選定](https://medium.com/flutter-jp/state-1daa7fd66b94)

## 余談

ちなみに今回作成したサンプルアプリのデータクラスは最近流行りの[ChatGPT](https://chat.openai.com/chat)に作ってもらいました。（一部修正）。技術の進歩って凄いですね。
