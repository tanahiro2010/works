# Slim標準ルーティングじゃちょっと描きにくかったので、DSLを作った話

## はじめに

Slim Frameworkでルーティングを書いていて、こう感じたことはないでしょうか。

- Groupがネストしてくると、どこに何のMiddlewareが効いているのか目で追いにくい
- ルート登録処理そのものが「手続き」になっていて、ルート一覧という「構造」が見えない
- ルートが増えるほど、レビューで差分を追うのがつらくなる

自分はまさにこれで詰まって、[`slim-router-dsl`](https://github.com/tanahiro2010/slim-router-dsl) というライブラリを作りました。この記事では、Slim標準のルーティングと slim-router-dsl を実際のコードで比較しながら、何がどう変わるのかを紹介します。

## Slim標準ルーティングの書き方

Slim標準では、ルーティングは「Appに対する命令」として書きます。

```php
$app->group('/api', function (RouteCollectorProxy $group) {
    $group->get('/health', HealthController::class);

    $group->group('/users', function (RouteCollectorProxy $group) {
        $group->get('', [UserController::class, 'index']);
        $group->post('', [UserController::class, 'create']);
        $group->get('/{id}', [UserController::class, 'show']);
    })->add(AuthMiddleware::class);
})->add(JsonMiddleware::class);
```

これはこれで動きますし、Slimのドキュメント通りの書き方です。ルートが数個のうちは十分読めるのですが、Groupのネストが2段・3段と深くなり、Middlewareが `->add()` で後付けされていくと、次のような問題が出てきます。

### Middlewareの適用順序と記述位置が一致しない

Slimの `->add()` はSlim内部ではLIFO（後から追加したものが先に実行される）でスタックされます。上の例だと、`/api/users` 配下のリクエストには `AuthMiddleware` → `JsonMiddleware` の順で処理が渡っていくのですが、コード上では逆に `JsonMiddleware` が外側のGroupに、`AuthMiddleware` が内側のGroupに書かれています。慣れていれば読めますが、初見だと「どっちが先に実行されるんだっけ」と一度頭の中で変換する必要があり、レビュー時にも地味にコストがかかります。

### 構造とロジックが同じ場所に混在する

クロージャの中に `$group->get()` を書くスタイルは、「ルートツリーの宣言」と「Appへの登録処理」が地続きになっています。クロージャの中では `$group` という可変な状態を操作しているだけなので、パッと見ただけでは「これは単なる定義なのか、それとも呼び出した瞬間に何か副作用が起きるのか」を意識しながら読む必要があります。実際、Slimではこのクロージャが呼ばれた時点でルートが登録されるため、「定義」と「登録」が完全に同じタイミングで起きています。

### 一覧性がない

今どんなルートが、どんなMiddleware付きで、どんな名前で登録されているのかを知りたいとき、標準のままだとコードを目で追うか、Slimを実際に起動してデバッグするしかありません。ルートが十数個を超えてくると、この「目で追う」作業自体がかなりの負担になってきます。

自分がこのライブラリを作った直接のきっかけも、まさにここでした。担当していたAPIでルートが増えてきたとき、「もう少し宣言的に、構造として書きたい」と思ったのが動機です。Slim標準のままだと今後さらに可読性が落ちそうだと感じたので、DSLとして切り出すことにしました。

## slim-router-dslの書き方

同じルーティングを slim-router-dsl で書くと、こうなります。

```php
use Tanahiro2010\SlimRouterDsl\Route;
use Tanahiro2010\SlimRouterDsl\Routes;

$routes = new Routes([
    Route::middleware(JsonMiddleware::class, [
        Route::get('/api/health', HealthController::class),

        Route::middleware(AuthMiddleware::class, [
            Route::group('/api/users', [
                Route::get('/', [UserController::class, 'index']),
                Route::post('/', [UserController::class, 'create']),
                Route::get('/{id}', [UserController::class, 'show']),
            ]),
        ]),
    ]),
]);

$routes->deploy($app);
```

見た目の違いだけを見るとそこまで大きくないかもしれませんが、性質はけっこう違います。順番に解説します。

### 1. ルート定義とSlimへの登録が分離されている

`new Routes([...])` の時点では、Slimに対して一切副作用が発生しません。あくまでメモリ上にルートツリー（ただのデータ構造）を組み立てているだけで、実際にSlimへ登録されるのは `$routes->deploy($app)` を呼んだ瞬間だけです。

これによって、「ルート定義だけを取り出してユニットテストする」「Appを一切起動せずにルート一覧を検査する」といったことが、特別な工夫なしに素直にできるようになります。Slim標準だとルート定義=登録処理なので、こうした「定義だけを扱う」操作をしようとすると、どうしてもApp自体をモックしたり、実際に組み立てたりする必要が出てきます。

### 2. Middlewareの実行順序が宣言順と一致する

DSL上で書いた順序（外側 → 内側）が、そのままリクエスト時の実行順序になるように `deploy()` が内部で登録順を調整してくれます。先ほどの例だと、外側の `Route::middleware(JsonMiddleware::class, ...)` → 内側の `Route::middleware(AuthMiddleware::class, ...)` という記述順のまま、`JsonMiddleware` → `AuthMiddleware` → Handlerの順で実行されます。Slim標準の `->add()` のLIFO事情を都度頭の中で変換する必要がなく、「上から読んだ通りに実行される」という素直な感覚のままコードが書けるのは、地味に大きい違いだと感じています。

また、`HttpRoute` はimmutableな設計になっていて、`middleware()` や `name()`、`meta()` を呼ぶたびに新しいインスタンスが返ります。元のインスタンスは変化しないので、Route単位で個別のMiddlewareや名前を付け足したいときも、意図しない副作用を気にせずFluentに書けます。

```php
Route::get('/me', [UserController::class, 'me'])
    ->middleware(AuthMiddleware::class)
    ->name('users.me');
```

Route単位で付けたMiddlewareは、GroupやMiddlewareノードから継承したものより後（Handlerに最も近い位置）で実行される、という順序ルールも決まっているので、「結局どのMiddlewareがどの順で効くのか」を推測せずに済みます。

### 3. ルートを一覧化・検証できる

Slimに登録する前の段階で、ルートツリーをそのまま検査できるAPIが揃っています。

```php
echo $routes->dump();
```

```text
METHOD  PATH                  NAME           MIDDLEWARE
GET     /api/health           -              Json
GET     /api/users            -              Json, Auth
GET     /api/users/{id}       -              Json, Auth
POST    /api/users            -              Json, Auth
```

コードを目で追わなくても、今どんなルートがどんなMiddleware付きで登録されるのかが一発でわかります。`dump()` は表示する列を `showMiddleware` / `showName` / `showHandler` で調整できますし、より生データが欲しい場合は `toArray()` や、readonlyオブジェクトの配列を返す `compile()` を使うこともできます。

さらに `validate()` を呼べば、Method+Pathの重複やRoute名の重複を、Slimを起動する前に検出できます。

```php
$routes->validate();
// 重複があれば DuplicateRouteException / DuplicateRouteNameException を投げる
```

`findByName()` / `filterByMethod()` / `findByPath()` / `filterByMiddleware()` といった検査系のAPIも用意されているので、「認証必須のルートだけ一覧したい」「特定のMiddlewareが付いているルートを洗い出したい」といった用途にも使えます。`meta()` で付与した任意のメタデータを使って `filter()` で絞り込むこともできるので、たとえば以下のように「認可が必要なルートだけ抽出する」といった使い方も可能です。

```php
Route::get('/users/{id}', [UserController::class, 'show'])
    ->name('users.show')
    ->meta(['auth' => true, 'permission' => 'users.read']);

$routes->filter(fn ($route) => $route->metadata['auth'] ?? false);
```

CLIも用意されているので、Slimアプリを一切起動しなくてもルート一覧の確認や検証ができます。

```bash
vendor/bin/router-dsl routes --bootstrap=routes.php
vendor/bin/router-dsl routes --bootstrap=routes.php --json
vendor/bin/router-dsl validate --bootstrap=routes.php
```

`routes` コマンドはSlimの `App` を一切生成せず `compile()`/`dump()`/`toArray()` のみを使うので、DIコンテナ全体を起動せずにルート一覧を確認できます。CIに `validate` コマンドを組み込んでおけば、重複ルートやRoute名の衝突をデプロイ前に機械的に検出できるのも便利なポイントです。

### 4. CRUD定義やController単位のグルーピングが楽になる

よくあるRESTfulなCRUDルートは `Route::resource()` で一括生成できます。

```php
Route::resource('/users', UserController::class);
// GET /users, GET /users/{id}, POST /users, PUT /users/{id}, PATCH /users/{id}, DELETE /users/{id}
```

生成対象を絞りたい場合は `only` / `except` が使えます(同時指定はできず、`InvalidRouteException` になります)。

```php
Route::resource('/users', UserController::class, only: ['index', 'show']);
Route::resource('/users', UserController::class, except: ['delete']);
```

同じControllerを使うルート群は `Route::controller()` でController class名の重複記述を省略できます。

```php
Route::controller(UserController::class, [
    Route::get('/', 'index'),
    Route::get('/{id}', 'show'),
    Route::post('/', 'create'),
]);
```

`Route::controller()` の配下では、Handlerに文字列を渡すと自動的に `[UserController::class, '<文字列>']` として解決されます。Closureや `[Class, method]` 配列を渡した場合はそのまま扱われるので、一部だけ別のHandlerにする、といった混在も問題なくできます。

## 例外もひとまとまりで扱える

DSL独自の例外はすべて `RouterDslException` を継承しているので、ライブラリ由来のエラーを一括でcatchできます。

```php
try {
    $routes->validate();
} catch (RouterDslException $e) {
    // DuplicateRouteException / DuplicateRouteNameException などをまとめて捕捉できる
}
```

`InvalidRouteNodeException`(childrenにRouteNode以外を渡した場合)や `InvalidMiddlewareException`(空のmiddleware配列を渡した場合)なども同じ基底なので、「DSLの使い方を間違えたときのエラー」と「アプリ側のロジックのエラー」を区別しやすくなっています。

## どちらを選ぶべきか

Slim標準ルーティングは、シンプルなAPIやルート数が少ないアプリでは十分に読みやすいですし、余計な依存も増えません。「Slimのドキュメント通りに書きたい」「学習コストをゼロにしたい」という場合は、標準のままで特に困らないと思います。

一方で、次のような状況では slim-router-dsl の恩恵が大きいと感じています。

- Groupのネストが深くなりがちなAPI(バージョニング、認可レベル、機能ドメインごとの分割など)
- Middlewareの適用範囲を、コードの見た目だけで正確に把握したい
- ルート一覧をレビューや監査の対象にしたい(`dump()` / `toArray()` / CI上の `validate` など)
- 大量のCRUDエンドポイントを持つAPI(`resource()` / `controller()` で記述量を減らしたい)

自分の場合は、ルート数がある程度の規模になってきたタイミングで「このまま素のSlimで書き続けると、数ヶ月後に自分でも読めなくなりそうだ」という危機感が先にあって、それを解消するためにこのDSLを作りました。同じような感覚を持ったことがある方には、一度試してみてもらえると嬉しいです。

## まとめ

自分がこのDSLを作った理由は単純で、「Slim標準のルーティングだと、ルートが増えたときに可読性が落ちそうだった」からです。ルーティングを「Appに対する命令の集合」ではなく「宣言的なルートツリー」として書けるようにしたことで、構造とMiddlewareの適用範囲が見た目のまま正しく伝わるようになりました。また `dump()` や `validate()` によって、ルート定義そのものをレビューや検証の対象にできるようになったのも、実際に運用していて助かっている部分です。

ソースコードは [GitHub](https://github.com/tanahiro2010/slim-router-dsl) で公開しています。詳しい使い方は [`/docs`](https://github.com/tanahiro2010/slim-router-dsl/tree/main/docs) を、実際に動くサンプルは [`/example`](https://github.com/tanahiro2010/slim-router-dsl/tree/main/example) を参照してみてください。
