---
title: Kotlin CoroutinesとFlowの違いを整理する
description: Kotlinの非同期処理でよく出てくるCoroutinesとFlowの違い・使い分けを、Androidでの利用シーンを交えて整理します。
duration: 12min
date: 2023-10-11
lang: ja-JP
draft: false
category: tech
tag: Kotlin, Coroutines, Flow
---

## はじめに

Kotlinの非同期処理と言えば、CoroutinesとFlowが定番です。
ただ、この2つはどちらも`suspend`や`CoroutineScope`が絡むので、初めて触ると「結局どう使い分ければいいんだ？」と迷ってしまいがち。

本記事では、両者の立ち位置と使い分けをコンパクトに整理します。

## 一言でいうと

- **Coroutines**：非同期処理を"同期っぽく"書くための仕組み（単発の値）
- **Flow**：非同期なストリームを扱うための仕組み（複数の値）

RxJavaを知っている方なら、FlowはほぼRxのObservableの立ち位置と捉えると分かりやすいです。

## Coroutines（単発の値）

ネットワーク通信のように、「1回呼んで1回結果が返ってくる」処理はCoroutinesが向いています。

```kotlin
suspend fun fetchUser(id: Long): User {
    return api.getUser(id)
}

viewModelScope.launch {
    val user = fetchUser(1)
    _state.value = UiState.Success(user)
}
```

- `suspend`：一時停止可能な関数
- `launch`：新たにCoroutineを起動する
- `viewModelScope`：ViewModelのライフサイクルに紐付いたScope

## Flow（連続する値）

DB更新通知や位置情報の変化のように「連続して値が流れてくる」処理はFlowが向いています。

```kotlin
val usersFlow: Flow<List<User>> = userDao.observeAll()

viewModelScope.launch {
    usersFlow.collect { users ->
        _state.value = UiState.Success(users)
    }
}
```

`collect`でFlowから値を受け取り続けます。
Roomやデータストアの多くがFlowを返すようになっているので、Android開発ではFlowに触れる機会が非常に多いです。

## StateFlow と SharedFlow

Android UI層でよく使われるのがこの2つ。

### StateFlow

UIの状態を持つのに向いた、**現在値を必ず保持する**Flow。

```kotlin
private val _counter = MutableStateFlow(0)
val counter: StateFlow<Int> = _counter.asStateFlow()

fun increment() {
    _counter.value += 1
}
```

Composeの`collectAsStateWithLifecycle()`と組み合わせると、状態駆動のUIが簡単に書けます。

### SharedFlow

エラー通知や一度きりのイベントなど、**現在値を持たない**ストリームに向いています。

```kotlin
private val _events = MutableSharedFlow<ToastEvent>()
val events: SharedFlow<ToastEvent> = _events

suspend fun showError() {
    _events.emit(ToastEvent("エラーが発生しました"))
}
```

## 使い分けの目安

| シーン | 使うべきもの |
|---|---|
| 1回だけ値を取得したい | suspend関数 |
| UIの現在状態を表現 | StateFlow |
| 一度きりのイベント | SharedFlow |
| Roomや位置情報の変化を監視 | Flow |

## Coroutine Scopeに注意

Coroutineは必ず「いつ終わるか」を決めたScopeの中で起動します。
Androidでは以下が基本。

| Scope | 推奨用途 |
|---|---|
| `viewModelScope` | ViewModel内の処理 |
| `lifecycleScope` | ActivityやFragment内 |
| `GlobalScope` | 原則使わない |

`GlobalScope`はアプリのライフサイクルと切り離されてしまうので、意図せずメモリリークやクラッシュの原因になりがち。
ライブラリ側で必要になった時以外は避けるのが無難です。

## Flow演算子の例

Flowには豊富な演算子があります。

```kotlin
usersFlow
    .map { users -> users.filter { it.isActive } }
    .distinctUntilChanged()
    .debounce(300)
    .flowOn(Dispatchers.Default) // ここまでをDefault Dispatcherで動かす
    .collect { /* UI更新 */ }
```

- `map`：要素を変換
- `distinctUntilChanged`：同じ値が連続した場合はスキップ
- `debounce`：一定時間経過してから流す
- `flowOn`：上流の実行Dispatcherを切り替える

RxJavaを使っていた方なら、ほぼ馴染みのある概念で書けます。

## おわりに

CoroutinesとFlowは、

- **1回の非同期 → Coroutines**
- **連続した非同期 → Flow**

というイメージで使い分ければ、ほとんどのケースは迷わないと思います。
Android開発ではFlow/StateFlowを触る機会が本当に多いので、基本的な演算子だけでも抑えておくとコーディングが速くなります。

## 参考文献

- [Kotlin Coroutines](https://kotlinlang.org/docs/coroutines-overview.html)
- [Kotlin Flow](https://kotlinlang.org/docs/flow.html)
- [Android公式: Kotlin Flows](https://developer.android.com/kotlin/flow)
