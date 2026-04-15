---
title: AndroidのRoomで始めるローカル永続化
description: AndroidのRoomライブラリを使ってSQLiteをラップし、型安全にローカル永続化を行う方法を紹介します。
duration: 15min
date: 2023-9-23
lang: ja-JP
draft: false
category: tech
tag: Android, Kotlin, Room
---

## はじめに

Androidでローカルにデータを永続化したいとき、直接SQLiteを叩くとボイラープレートが多すぎて辛いですよね。
そこで活躍するのがJetpackの一部として提供されている[Room](https://developer.android.com/training/data-storage/room)です。

Roomは「SQLiteの薄いラッパー」ではなく、アノテーションベースで型安全なDBアクセスを提供してくれるライブラリ。
コンパイル時にクエリの整合性まで検査してくれるので、かなりミスが減ります。

本記事では、Roomの基本的な使い方をまとめます。

## 依存関係

```kotlin
dependencies {
    val roomVersion = "2.5.2"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")
}
```

kaptよりも高速な`ksp`が主流になってきているので、新規プロジェクトは`ksp`でOKです。

## Roomの3つの構成要素

Roomは以下の3つの役割でDBを構成します。

| 要素 | 役割 |
|---|---|
| Entity | テーブルとなるデータクラス |
| DAO | SQLを発行するインターフェース |
| Database | Entity/DAOをまとめるDB本体 |

## Entityの定義

```kotlin
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val email: String,
)
```

- `@Entity`でテーブルを表す
- `@PrimaryKey`で主キーを指定
- `autoGenerate = true`にしておくとIDを自動採番

## DAOの定義

DAO (Data Access Object) はCRUD操作を定義するインターフェースです。

```kotlin
@Dao
interface UserDao {

    @Query("SELECT * FROM users ORDER BY id DESC")
    fun observeAll(): Flow<List<UserEntity>>

    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun findById(id: Long): UserEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(user: UserEntity)

    @Delete
    suspend fun delete(user: UserEntity)
}
```

Flowを戻り値にしておくと、DBの変更をリアルタイムに監視できます。
Composeと組み合わせた時の体験が良いです。

## Databaseクラス

```kotlin
@Database(
    entities = [UserEntity::class],
    version = 1,
    exportSchema = true,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
```

## シングルトンとして提供する

```kotlin
object DatabaseProvider {
    @Volatile private var instance: AppDatabase? = null

    fun get(context: Context): AppDatabase {
        return instance ?: synchronized(this) {
            instance ?: Room.databaseBuilder(
                context.applicationContext,
                AppDatabase::class.java,
                "app.db",
            ).build().also { instance = it }
        }
    }
}
```

実務ではHiltでDIしてしまう方が多いですが、まずはシングルトンで動かしてみるとイメージがつきやすいです。

## 実際に使ってみる

```kotlin
class UserRepository(private val dao: UserDao) {
    fun observeUsers(): Flow<List<UserEntity>> = dao.observeAll()

    suspend fun addUser(name: String, email: String) {
        dao.upsert(UserEntity(name = name, email = email))
    }
}
```

ViewModelからはこうです。

```kotlin
class UserViewModel(
    private val repository: UserRepository,
) : ViewModel() {

    val users: StateFlow<List<UserEntity>> =
        repository.observeUsers().stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = emptyList(),
        )

    fun add(name: String, email: String) {
        viewModelScope.launch {
            repository.addUser(name, email)
        }
    }
}
```

## マイグレーション

テーブルに列を追加したい、といった変更にはマイグレーションが必要です。

```kotlin
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE users ADD COLUMN age INTEGER NOT NULL DEFAULT 0")
    }
}

Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
    .addMigrations(MIGRATION_1_2)
    .build()
```

破壊的で良いなら`fallbackToDestructiveMigration()`で全データを消してマイグレーション...という手もありますが、本番では避けましょう。

## Type Converter

`Date`や`Enum`をそのままEntityに持たせたい場合は、Type Converterを使います。

```kotlin
class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? = value?.let { Date(it) }

    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? = date?.time
}

@Database(
    entities = [UserEntity::class],
    version = 2,
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() { /* ... */ }
```

## おわりに

Roomは一度セットアップしてしまえば、型安全・Flow対応・マイグレーションと至れり尽くせりのDBライブラリです。
個人開発でもちょっとしたキャッシュ層として使えるので、SQLiteを直接叩くくらいならぜひRoomを試してみてください！

## 参考文献

- [Room persistence library](https://developer.android.com/training/data-storage/room)
- [Room with Kotlin Flow](https://developer.android.com/kotlin/flow)
