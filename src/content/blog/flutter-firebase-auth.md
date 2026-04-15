---
title: FlutterにFirebase Authenticationを導入する
description: FlutterアプリでFirebase Authenticationを使ってメール・Google・匿名ログインを実装する手順をまとめます。
duration: 15min
date: 2023-7-2
lang: ja-JP
draft: false
category: tech
tag: Flutter, Firebase, Authentication
---

## はじめに

個人開発でもSaaSでも、ユーザー認証は欠かせない機能のひとつ。
自前で実装するとセキュリティやインフラ面が重くなりがちなので、Flutterでは[Firebase Authentication](https://firebase.google.com/docs/auth)に頼るのが手軽で安全です。

本記事では、FlutterでFirebase Authを使うときの基本的な手順をまとめていきます。

## セットアップ

### 1. Firebaseプロジェクトの作成

[Firebaseコンソール](https://console.firebase.google.com/)で新規プロジェクトを作成します。
その後、Authentication > Sign-in methodでメール/パスワードなど使いたい方法を有効化しておきます。

### 2. FlutterFire CLIで初期化

従来は`GoogleService-Info.plist`や`google-services.json`を手動で配置する必要がありましたが、今は[flutterfire_cli](https://firebase.flutter.dev/docs/cli)を使うのが圧倒的に楽です。

```bash
dart pub global activate flutterfire_cli
flutterfire configure
```

`lib/firebase_options.dart`が自動生成されます。

### 3. パッケージの追加

```yaml
dependencies:
  firebase_core: ^2.13.0
  firebase_auth: ^4.6.0
  google_sign_in: ^6.1.0 # Googleログインする場合
```

### 4. 初期化

`main.dart`でFirebaseを初期化します。

```dart
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}
```

## メール/パスワード認証

### サインアップ

```dart
Future<void> signUp(String email, String password) async {
  try {
    await FirebaseAuth.instance.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
  } on FirebaseAuthException catch (e) {
    if (e.code == 'weak-password') {
      print('パスワードが脆弱です');
    } else if (e.code == 'email-already-in-use') {
      print('そのメールアドレスは既に使われています');
    }
  }
}
```

### サインイン

```dart
Future<void> signIn(String email, String password) async {
  await FirebaseAuth.instance.signInWithEmailAndPassword(
    email: email,
    password: password,
  );
}
```

### サインアウト

```dart
await FirebaseAuth.instance.signOut();
```

## Googleログイン

```dart
Future<UserCredential> signInWithGoogle() async {
  final googleUser = await GoogleSignIn().signIn();
  final googleAuth = await googleUser?.authentication;

  final credential = GoogleAuthProvider.credential(
    accessToken: googleAuth?.accessToken,
    idToken: googleAuth?.idToken,
  );

  return FirebaseAuth.instance.signInWithCredential(credential);
}
```

iOSの場合は`Info.plist`にReversed Client IDの設定が必要です。詳しくは公式ドキュメントを参照してください。

## 匿名ログイン

試用ユーザー用に匿名ログインを提供しておくと便利です。

```dart
await FirebaseAuth.instance.signInAnonymously();
```

後からメールアドレスを登録してもらえば、同じアカウントを引き継げます。

```dart
final credential = EmailAuthProvider.credential(
  email: email,
  password: password,
);
await FirebaseAuth.instance.currentUser?.linkWithCredential(credential);
```

## 認証状態の監視

リアルタイムに認証状態を監視するには`authStateChanges`が便利です。

```dart
StreamBuilder<User?>(
  stream: FirebaseAuth.instance.authStateChanges(),
  builder: (context, snapshot) {
    if (snapshot.connectionState == ConnectionState.waiting) {
      return const CircularProgressIndicator();
    }
    if (snapshot.hasData) {
      return const HomePage();
    }
    return const LoginPage();
  },
);
```

ログイン/ログアウトに応じて画面が自動で切り替わります。

## よくあるつまずきポイント

- **iOSで真っ白になる**：`Info.plist`のURL Types設定漏れ
- **Androidでクラッシュ**：SHA-1フィンガープリントの登録忘れ
- **Googleログイン後にUserがnull**：`signInWithCredential`の戻り値を`await`していない

エラーが出たら一度`flutterfire configure`を再実行するだけで解決するケースも多いです。

## おわりに

Firebase AuthはFlutterと非常に相性が良く、個人開発レベルなら数十分で認証フローが組めます。
プロダクションで使うときは、**メール認証必須**や**reCAPTCHAの有効化**など、セキュリティ設定の見直しも忘れずに。

## 参考文献

- [FlutterFire公式ドキュメント](https://firebase.flutter.dev/docs/overview)
- [Firebase Auth](https://firebase.google.com/docs/auth/flutter/start)
