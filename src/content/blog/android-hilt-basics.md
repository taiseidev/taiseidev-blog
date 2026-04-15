---
title: AndroidのDI入門：Hiltの基本的な使い方
description: Android公式推奨のDIライブラリHiltの基本概念と、ViewModel/Repository構成での使い方をまとめます。
duration: 13min
date: 2023-11-18
lang: ja-JP
draft: false
category: tech
tag: Android, Kotlin, Hilt, DI
---

## はじめに

Android開発でDI（Dependency Injection）を導入したいとき、公式が推奨しているのが[Hilt](https://developer.android.com/training/dependency-injection/hilt-android)です。
HiltはDaggerをAndroid向けにシンプル化したライブラリで、セットアップがかなり楽になっています。

本記事では、HiltをAndroidアプリに導入するための基本的な流れをまとめます。

## 依存関係

```kotlin
// プロジェクトレベル build.gradle.kts
plugins {
    id("com.google.dagger.hilt.android") version "2.48" apply false
}

// アプリレベル build.gradle.kts
plugins {
    id("kotlin-kapt")
    id("com.google.dagger.hilt.android")
}

dependencies {
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-android-compiler:2.48")
}
```

`kapt`ではなく`ksp`を使いたい場合は、Hiltがkspに対応次第乗り換えることができます。

## アプリケーションクラスの設定

Hiltを使うには、Applicationクラスに`@HiltAndroidApp`を付けます。

```kotlin
@HiltAndroidApp
class MyApp : Application()
```

`AndroidManifest.xml`にも登録を忘れずに。

```xml
<application android:name=".MyApp" ... />
```

## ActivityとFragmentで使う

```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() { /* ... */ }
```

`@AndroidEntryPoint`を付けると、そのクラスでフィールドインジェクションやViewModelの注入ができるようになります。

## ViewModelへのインジェクション

```kotlin
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository,
) : ViewModel() { /* ... */ }
```

Activity/Fragmentからはおなじみの`by viewModels()`で取得できます。

```kotlin
class MainActivity : ComponentActivity() {
    private val viewModel: UserViewModel by viewModels()
}
```

## Moduleで依存を提供する

インターフェースの実装や外部ライブラリのインスタンスなど、`@Inject constructor`で解決できないものは`@Module`で提供します。

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit =
        Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .addConverterFactory(MoshiConverterFactory.create())
            .build()

    @Provides
    @Singleton
    fun provideUserApi(retrofit: Retrofit): UserApi =
        retrofit.create(UserApi::class.java)
}
```

- `@InstallIn(SingletonComponent::class)`：アプリ全体でシングルトンとして共有
- `@Provides`：インスタンス生成方法を示す
- `@Singleton`：スコープ内で単一インスタンス

## Interfaceの実装を束ねる

Repositoryなど、インターフェースを実装するクラスがある場合は`@Binds`を使います。

```kotlin
interface UserRepository {
    suspend fun fetch(id: Long): User
}

class UserRepositoryImpl @Inject constructor(
    private val api: UserApi,
) : UserRepository {
    override suspend fun fetch(id: Long): User = api.getUser(id)
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    @Singleton
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}
```

`@Binds`は`@Provides`より最適化が効くので、単にインターフェースをバインドするだけなら`@Binds`を選びます。

## Scopeの使い分け

Hiltで代表的なスコープは以下。

| Scope | ライフサイクル |
|---|---|
| `@Singleton` | Application全体 |
| `@ActivityRetainedScoped` | 画面回転を跨いで保持 |
| `@ActivityScoped` | Activityごと |
| `@ViewModelScoped` | ViewModelごと |
| `@FragmentScoped` | Fragmentごと |

Repositoryは基本`@Singleton`、Use Caseは`@ViewModelScoped`、のように使い分けるとシンプルです。

## Composeへの注入

JetpackComposeでは`hiltViewModel()`が用意されています。

```kotlin
@Composable
fun UserScreen(viewModel: UserViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    // UI
}
```

## よくあるハマりどころ

- **`@HiltAndroidApp`の付け忘れ**：AppクラスでのDIが動かない
- **AndroidManifestへの登録忘れ**：同上
- **`@AndroidEntryPoint`を付け忘れる**：ViewModelのinjectができない
- **Moduleの`@InstallIn`が間違い**：スコープ不一致エラー

Hiltはエラーメッセージがかなり親切なので、コンパイルエラーをよく読むと解決できるケースがほとんどです。

## おわりに

Hiltはセットアップさえ乗り越えれば、DaggerほどのボイラープレートがなくDIを導入できます。
Androidでテスタブルな設計にしたい場合、個人的には真っ先に入れるライブラリのひとつです。

## 参考文献

- [Dependency Injection with Hilt](https://developer.android.com/training/dependency-injection/hilt-android)
- [Dagger Hilt公式](https://dagger.dev/hilt/)
