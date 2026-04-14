---
title: KotestのLifecycle hooksについてまとめてみた
description: Kotestで使えるbefore/after系のライフサイクル関数をまとめて解説。使い分けに迷う方に向けて、実際のコード例とともに詳しく紹介します。
duration: 10min
date: 2025-3-29
lang: ja-JP
draft: false
category: tech
tag: Kotlin,Kotest,自動テスト
image:
  src: "/ogp/kotest-before-after.png"
  alt: "kotest-before-after`"
---

## はじめに

Kotestに限らず、テストコードを書く際にはbefore/afterといった前後処理関数を使うことがあります。ただ、Kotestではそれらの関数が非常に多く用意されており、結局どれを使えば良いのか迷うことがあるかと思います。

そこで今回は、Kotestで使えるライフサイクル系のbefore/after関数について、実際のコード例を交えてまとめてみました。
どのように活用できるかを実際のコードを交えながら解説していくので、是非、Kotestを使ったテストコードを書く際の参考にしていただけたら嬉しいです！

### version
Kotest: ver 5.9.1

## 対象者
- Kotlinでテストを書く際にbefore/afterの使い方を学びたい方
- Kotestを使いこなしたい初心者〜中級者向け
- テストの前後処理を効率的に行いたい方

## Kotestのbefore/afterの種類

Kotestには多くのライフサイクル関数が用意されており、以下のようなものがあります（公式：[Lifecycle hooks](https://kotest.io/docs/framework/lifecycle-hooks.html)）：

| 関数名            |
|-------------------|
| beforeContainer    |
| afterContainer     |
| beforeEach         |
| afterEach          |
| beforeAny          |
| afterAny           |
| beforeTest         |
| afterTest          |
| beforeSpec         |
| afterSpec          |
| finalizeSpec       |
| beforeInvocation   |
| afterInvocation    |

> 公式ドキュメントでは***prepareSpec***というメソッドが記載されていますが、[Sanitize prepareSpec and finalizeSpec behavior ](https://github.com/kotest/kotest/pull/1617/files#diff-cead89fdee3b0f2c28eb11479c5e4e8a7124877fa30ee93b591c58e75f5e8652)でDeprecatedになり、現在は使用できないです。

### 前提

今回はKotestの中でも***DescribeSpec***を使って解説してきますが、他のKotestの書き方を使っても基本的には動作に変わりはありません。
***DescribeSpec***を使ったことがない方のために簡単な使い方を解説します。慣れている方は読み飛ばしてください。

***DescribeSpec***は、テストケースを階層構造で整理しやすい***BDDスタイル***のSpecです。
テスト対象の機能や振る舞いをdescribe {} ブロックで表現し、その中で条件ごとの前提をcontext{}で区切り、個別の動作確認をit{}で記述するのが特徴です。
簡単に説明すると、***describe***にテスト対象のクラスや関数名を記述、***context***でテスト条件を指定、***it***で結果を記述し、個別のテストを行なっていきます。

```kotlin
class SampleTest : DescribeSpec({
    describe("ユーザー登録機能") {
        context("入力が正しい場合") {
            it("登録に成功すること") {
                // アサーション
            }
        }

        context("メールアドレスが無効な場合") {
            it("登録に失敗すること") {
                // アサーション
            }
        }
    }
})
```

このように、describe→context→itの構造にすることで、テストの意図を自然な言葉で表現でき、可読性の高いテストを書くことができます。

## 1. Spec単位で1回だけ実行される関数

|関数名|説明|
|---|---|
|beforeSpec|Specインスタンスが生成されたあと、最初に1回だけ実行される処理。DBの初期化や一時ファイル作成などに使用|
|afterSpec|Spec内の全てテストが終わった後に1回だけ実行される。リソース解放やログ出力に使用|
|finalizeSpec|afterSpecの後に呼ばれる|

```kotlin
class KotestLifecycleDemo : DescribeSpec({
    beforeSpec {
        println("[beforeSpec] Specの最初に1回だけ実行")
    }

    afterSpec {
        println("[afterSpec] Specの最後に1回だけ実行")
    }

    finalizeSpec {
        println("[finalizeSpec] Spec終了後のクリーンアップ処理")
    }

    describe("ライフサイクルテスト") {

        it("テストケース1") {
            println("→ テストケース1 実行中")
        }

        it("テストケース2") {
            println("→ テストケース2 実行中")
        }
    }
})
```

```
[beforeSpec] Specの最初に1回だけ実行
→ テストケース1 実行中
→ テストケース2 実行中
[afterSpec] Specの最後に1回だけ実行
[finalizeSpec] Spec終了後のクリーンアップ処理
```

SpecとはKotestにおけるテストクラスのインスタンスのことを指します。
つまり、今回のケースだと***KotestLifecycleDemo***インスタンスが作成された際に***beforeSpec***が実行され、すべてのテストケースが終了した際に***afterSpec***が実行されます。
***finalizeSpec***はあまり使う機会はないかもしれませんが、***afterSpec***が実行された後に実行されます。

上記の用途としては、***beforeSpec***でDBのインスタンスを立ち上げて、***afterSpec***でDBの接続を切るといった使い方ができると思います。

## 2. 各テスト関数の前後で実行される関数

|関数名|説明|
|---|---|
|beforeEach|各テスト関数の直前に毎回実行。共通の前準備に使用する|
|afterEach|各テスト関数の直後に毎回実行。テストの後処理やクリーンアップに使用する。テストが失敗した場合も必ず実行される。|

```kotlin
class KotestLifecycleDemo : DescribeSpec({
    beforeEach {
        println("[beforeEach] 各テスト単位の前に実行")
    }

    afterEach {
        println("[afterEach] 各テスト単位の後に実行")
    }

    describe("ライフサイクルテスト") {

        it("テストケース1") {
            println("→ テストケース1 実行中")
        }

        it("テストケース2") {
            println("→ テストケース2 実行中")
        }
    }
})
```

```
[beforeEach] 各テスト単位の前に実行
→ テストケース1 実行中
[afterEach] 各テスト単位の後に実行
[beforeEach] 各テスト単位の前に実行
→ テストケース2 実行中
[afterEach] 各テスト単位の後に実行
```

***beforeEach***/***afterEach***はシンプルで、各テスト（***it***）が実行される前後に実行されます。

## 3. describe/contextブロックの前後で実行される関数

|関数名|説明|
|---|---|
|beforeContainer|describeやcontextなどのブロックの直前に実行。|
|afterContainer|ブロックのすべてのテストが終わった後に実行。テストが失敗した場合も必ず実行される。|

```kotlin
class KotestLifecycleDemo : DescribeSpec({
    beforeContainer {
        println("[beforeContainer] Containerの前に実行")
    }

    afterContainer {
        println("[afterContainer] Containerの後に実行")
    }

    describe("ライフサイクルテスト - describe ブロック") {

        it("テストケース1") {
            println("→ テストケース1 実行中")
        }

        it("テストケース2") {
            println("→ テストケース2 実行中")
        }

        context("ライフサイクルテスト - context ブロック") {

            it("テストケース3") {
                println("→ テストケース3 実行中")
            }

            it("テストケース4") {
                println("→ テストケース4 実行中")
            }
        }
    }

    describe("テストケース5") {
        it("テストケース5") {
            println("→ テストケース5 実行中")
        }
    }

    describe("テストケース6") {}
})
```

```
[beforeContainer] Containerの前に実行
→ テストケース1 実行中
→ テストケース2 実行中
[beforeContainer] Containerの前に実行
→ テストケース3 実行中
→ テストケース4 実行中
[afterContainer] Containerの後に実行
[afterContainer] Containerの後に実行
[beforeContainer] Containerの前に実行
→ テストケース5 実行中
[afterContainer] Containerの後に実行
```

***beforeContainer***/***afterContainer***は、各***describe***や***context***ブロックの中に実行対象となるテスト（***it***）がある場合に限り、そのブロックの実行前後に1回ずつ実行されます。<br>
注意点として、ブロック内に有効なテストが1つもない場合（すべてスキップなど）には呼ばれません。

## 4. すべてのTestTypeに対して実行される関数

|関数名|説明|
|---|---|
|beforeAny|各TestCase（describe,context,itなど）の直前に呼ばれる。ラムダでTestCaseを受け取る。|
|afterAny|各TestCaseの実行後に呼ばれる。スキップされたテストには呼ばれない。ラムダでTuple2<TestCase, TestResult>を受けとる。テストが失敗した場合も必ず実行される。|

```kotlin
class KotestLifecycleDemo : DescribeSpec({

    beforeAny { testCase: TestCase ->
        println("[beforeAny] 実行前: ${testCase.name.testName} - type: ${testCase.type.name}")
    }

    afterAny { (testCase, result) ->
        println("[afterAny] 実行後: ${testCase.name.testName} - type: ${testCase.type.name} - result: ${result.status}")
    }

    describe("ライフサイクルテスト - describe ブロック") {

        it("テストケース1") {
            println("→ テストケース1 実行中")
        }

        it("テストケース2") {
            println("→ テストケース2 実行中")
        }

        context("ライフサイクルテスト - context ブロック") {

            it("テストケース3") {
                println("→ テストケース3 実行中")
            }

            it("テストケース4") {
                println("→ テストケース4 実行中")
            }
        }
    }
})
```

```
[beforeAny] 実行前: ライフサイクルテスト - describe ブロック - type: Container
[beforeAny] 実行前: テストケース1 - type: Test
→ テストケース1 実行中
[afterAny] 実行後: テストケース1 - type: Test - result: Success
[beforeAny] 実行前: テストケース2 - type: Test
→ テストケース2 実行中
[afterAny] 実行後: テストケース2 - type: Test - result: Success
[beforeAny] 実行前: ライフサイクルテスト - context ブロック - type: Container
[beforeAny] 実行前: テストケース3 - type: Test
→ テストケース3 実行中
[afterAny] 実行後: テストケース3 - type: Test - result: Success
[beforeAny] 実行前: テストケース4 - type: Test
→ テストケース4 実行中
[afterAny] 実行後: テストケース4 - type: Test - result: Success
[afterAny] 実行後: ライフサイクルテスト - context ブロック - type: Container - result: Success
[afterAny] 実行後: ライフサイクルテスト - describe ブロック - type: Container - result: Success
```

***beforeAny***/***afterAny***は***beforeEach***/***afterEach***と違って全てのTestTypeの前後で実行されます。
そもそもTestTypeとは何かについて、TestTypeはKotest内部で定義されているenumで、このTestCaseがどういう種類かを区別するために使われます。

|type|説明|
|---|---|
|TestType.Test|通常のテストケースに使われる（it {}やshould {}など）。実行されるテスト本体。|
|TestType.Container|グループ化されたテスト構造（describe {}やcontext {}など）に使われる。ラムダ内にitなどのテストを書く構造。|
|TestType.Dynamic|forAll {}やcheckAll {}などの動的に生成されるテストケースに使われる。|

2章で各テスト毎に実行される***beforeEach***/***afterEach***について説明しましたが、これらはTestType.Testの時のみ実行され、***beforeAny***/***afterAny***は全てのTestTypeの前後において実行されるということになります。

> ***beforeTest***/***afterTest***に関しては***beforeAny***/***afterAny***と基本的には同じ挙動なので今回は省略します。

## 5. テストの繰り返し（invocation）ごとに実行される関数

|関数名|説明|
|---|---|
|beforeInvocation|テスト関数が複数回実行される場合に、各実行（invocation）の直前に呼ばれる。第一引数ではTestCaseクラスを受け取り、第二引数では現在の実行回数を受け取る。|
|afterInvocation|各実行（invocation）の直後に呼ばれる。こちらも***beforeInvocation***と同様の引数を受け取る|

> 注意点: 第二引数のインデックスはListのインデックスと同様に 0から始まります

```kotlin
class KotestLifecycleDemo : DescribeSpec({

    beforeInvocation { testCase: TestCase, iteration: Int ->
        println("  → [beforeInvocation] ${testCase.name.testName} : invocation #$iteration")
    }

    afterInvocation { testCase: TestCase, iteration: Int ->
        println("  → [afterInvocation] ${testCase.name.testName} : invocation #$iteration")
    }

    describe("ライフサイクルテスト - describe ブロック") {

        it("テストケース1（3回繰り返し）").config(invocations = 3) {
            println("→ テストケース1 実行中")
        }

        it("テストケース2（1回のみ）") {
            println("→ テストケース2 実行中")
        }

        context("ライフサイクルテスト - context ブロック") {

            it("テストケース3（2回繰り返し）").config(invocations = 2) {
                println("→ テストケース3 実行中")
            }

            it("テストケース4（1回のみ）") {
                println("→ テストケース4 実行中")
            }
        }
    }
})
```

```
  → [beforeInvocation] ライフサイクルテスト - describe ブロック : invocation #0
  → [beforeInvocation] テストケース1（3回繰り返し） : invocation #0
→ テストケース1 実行中
  → [afterInvocation] テストケース1（3回繰り返し） : invocation #0
  → [beforeInvocation] テストケース1（3回繰り返し） : invocation #1
→ テストケース1 実行中
  → [afterInvocation] テストケース1（3回繰り返し） : invocation #1
  → [beforeInvocation] テストケース1（3回繰り返し） : invocation #2
→ テストケース1 実行中
  → [afterInvocation] テストケース1（3回繰り返し） : invocation #2
  → [beforeInvocation] テストケース2（1回のみ） : invocation #0
→ テストケース2 実行中
  → [afterInvocation] テストケース2（1回のみ） : invocation #0
  → [beforeInvocation] ライフサイクルテスト - context ブロック : invocation #0
  → [beforeInvocation] テストケース3（2回繰り返し） : invocation #0
→ テストケース3 実行中
  → [afterInvocation] テストケース3（2回繰り返し） : invocation #0
  → [beforeInvocation] テストケース3（2回繰り返し） : invocation #1
→ テストケース3 実行中
  → [afterInvocation] テストケース3（2回繰り返し） : invocation #1
  → [beforeInvocation] テストケース4（1回のみ） : invocation #0
→ テストケース4 実行中
  → [afterInvocation] テストケース4（1回のみ） : invocation #0
  → [afterInvocation] ライフサイクルテスト - context ブロック : invocation #0
  → [afterInvocation] ライフサイクルテスト - describe ブロック : invocation #0
```

Kotestの***it***は***TestWithConfigBuilder***を返します。このビルダーが持つ***config***関数を用いることで、各テストケースに対して設定を追加できます。
その中でも***invocations***は、同じテストを何回繰り返すかを指定するためのオプションです。

```kotlin
it("Sample Test").config(invocations = 3) {
    // 3回実行される
}
```

このように設定した場合、***beforeInvocation***/***afterInvocation***は3回それぞれの前後で呼び出され、各回のインデックス（0, 1, 2）を受け取ることができます。

## 補足：スキップされたテストケースには呼ばれない

各before/after関数にもテストケースが呼ばれない例外があります。
それは、スキップされたテスト（無視・無効・非アクティブな状態のテスト）にはコールバックが呼ばれないという点です。

公式ドキュメントにも、次のように明記されています：

> If a test case was skipped (ignored / disabled / inactive), then this callback will not be invoked for that particular test case.

### スキップされる例

以下のようなケースでは特定のライフサイクル関数は呼び出されません。

```kotlin
xit("無効化されたテスト") {
}

it("無効化されたテスト").config(enabled = false) {

}

```

## まとめ
Kotestでは、テストの実行タイミングに応じてさまざまなライフサイクル関数が用意されています。
どのタイミングでどの関数が呼ばれるのかを理解しておくことで、テストコードをより効率的かつ安全に構築することができます。
是非、before/afterを上手に活用して、テストの品質を向上させましょう！！
