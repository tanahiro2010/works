---
marp: true
theme: default
paginate: true
header: "SQLインジェクション講座"
footer: "© 2026"
style: |
  section {
    font-family: 'Hiragino Sans', 'Noto Sans JP', sans-serif;
    font-size: 1.35rem;
  }
  h1 {
    color: #cf222e;
    border-bottom: 3px solid #cf222e;
    padding-bottom: 0.2em;
  }
  h2 {
    color: #1a7f37;
  }
  code {
    background: #f6f8fa;
    border-radius: 4px;
    padding: 0.1em 0.4em;
    font-size: 0.85em;
  }
  pre {
    color-scheme: dark;
    background: #161b22;
    color: #e6edf3;
    border-radius: 8px;
    padding: 0.8em;
    font-size: 0.72em;
  }
  .warning {
    background: #fff8c5;
    border-left: 4px solid #d4a017;
    padding: 0.5em 1em;
    border-radius: 0 4px 4px 0;
  }
  .danger {
    background: #ffebe9;
    border-left: 4px solid #cf222e;
    padding: 0.5em 1em;
    border-radius: 0 4px 4px 0;
  }
  .poc {
    background: #ddf4ff;
    border-left: 4px solid #0969da;
    padding: 0.5em 1em;
    border-radius: 0 4px 4px 0;
  }
---

# SQLインジェクション
## ――攻撃の仕組みから対策まで

田中博悠 / 2026年7月

---

# 対象者

- **SQLの基本文法**（`SELECT` / `INSERT` / `WHERE`）を読んだことがある人
- Web開発で**DBを使ったことがある**人（言語・フレームワークは問わない）
- 「SQLインジェクション」という言葉は知っているが、**手を動かしたことはない**人

<div class="warning">

SQL文法そのものの解説はしません。**SQLインジェクションの仕組みと対策**に集中します。

</div>

---

# はじめに

<div class="danger">

🚨 **このスライドと配布するサンドボックスは学習目的専用です**

- 許可のないシステムへの攻撃は**不正アクセス禁止法**等の違反です
- PoCは必ず**自分のPC上でローカルに動かした**環境に対してのみ実行してください

</div>

---

# アジェンダ

1. SQLインジェクションとは
2. なぜ起こるのか（仕組み）
3. 基本編：ログインバイパス
4. 基本編：UNIONベースの攻撃
5. 発展編：ブラインドSQLインジェクション
6. 発展編：スタック型・セカンドオーダー
7. 対策：プリペアドステートメントほか
8. まとめ

---

# 演習の進め方（4ステップ）

各PoCはこの4ステップで進めます。**攻撃して終わりにしない**のがポイント。

1. 🔍 **脆弱なコードを読む**（`app.py`）→ どこが危ないか予想する
2. 💥 **攻撃してみる** → ペイロードを入力し、突破できることを確認する
3. 🔧 **自分で修正する** → `app.py` の該当箇所をプレースホルダに書き換える
4. ✅ **再攻撃して防御を確認する** → 同じペイロードが効かなくなることを確認する

答え合わせ用に `secure_app.py` を用意していますが、
**まず自分で直してから**見るとより理解が深まります

---

# 1. SQLインジェクションとは

## 定義

アプリケーションが**ユーザーの入力をそのままSQL文に組み込んでしまう**ことで、
攻撃者が意図しないSQLを実行できてしまう脆弱性

## できてしまうこと

- 認証の回避（ログインバイパス）
- 他人のデータの閲覧・改ざん・削除
- データベース全体の抽出
- 場合によっては**OS上のコマンド実行**まで拡大することも

---

# OWASP Top 10 での位置づけ

- 長年 **Injection** カテゴリの中心的存在
- 2021年版では `A03:2021 – Injection` に統合
- 依然として**実際のインシデントで多発**する脆弱性

> 「古い脆弱性」ではなく「今も現役の脆弱性」

---

# 2. なぜ起こるのか

## 文字列結合でSQLを組み立てるコード

```python
username = request.form["username"]
password = request.form["password"]

query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
cur.execute(query)
```

- `username` や `password` に**SQLの構文として意味を持つ文字**（`'` や `--` など）を
  混ぜられると、SQL文の意味が変わってしまう

---

# 文字列結合の危険性（図解）

```
本来のSQL:
SELECT * FROM users WHERE username = '[入力]' AND password = '[入力]'

username に  admin' --  を入力すると…

SELECT * FROM users WHERE username = 'admin' --' AND password = '...'
                                              ↑ ここから後ろはコメント化
```

→ パスワードチェックの部分が**丸ごと無視される**

---

# 3. 基本編：ログインバイパス

## 典型的なペイロード

| ユーザー名に入力 | 効果 |
|---|---|
| `admin' --` | パスワード条件をコメントアウト |
| `admin' #` | MySQLでの同上（`#`がコメント） |
| `' OR '1'='1' --` | 常に真になる条件を追加 |

`'1'='1'` は常に真 → `WHERE` 条件全体が真になり、最初のレコードでログイン成立

---

<div class="poc">

## 🧪 PoC①：ログインバイパスをやってみよう

フォルダ：`01_login_bypass/`

```bash
cd 01_login_bypass && pip install -r requirements.txt && python app.py
# http://127.0.0.1:5001
```

1. `app.py` の文字列結合部分を確認する
2. ユーザー名 `admin' --` ／パスワード空欄でログイン →**突破できることを確認**
3. `app.py` を `?` プレースホルダに書き換えてみる
4. 同じ入力で**ログインが失敗することを確認**（答え合わせ：`secure_app.py`）

</div>

---

# 🎯 PoC①で理解してほしいこと

- 文字列結合だと、入力に含まれる `'` が**SQLの構文の一部として解釈**されてしまう
  → `--` や `OR '1'='1'` で条件を自由に書き換えられる
- プレースホルダ（`?`）を使うと、入力値は**常に「単なる値」として渡される**
  → `'` や `--` が入っていても構文としては解釈されない
- この「文字列結合 → プレースホルダ」というパターンは、**以降のPoCでも繰り返し出てくる**

---

# 4. 基本編：UNIONベースの攻撃

## UNION SELECT とは

2つの `SELECT` の結果を**縦に結合**するSQL構文。
検索結果として表示される画面に、**別のテーブルの内容を紛れ込ませる**ことができる。

## 攻撃の手順

1. `ORDER BY` などでカラム数を特定する
2. `UNION SELECT` で列数・型を一致させる
3. 抜き出したいテーブル（例：`users`）を指定する

---

# UNION攻撃の実例

脆弱な検索クエリ（商品名検索、3カラムを表示）：

```sql
SELECT id, name, price FROM products WHERE name LIKE '%[入力]%'
```

攻撃者の入力：

```
%' UNION SELECT id, username, password FROM users --
```

→ 商品一覧の中に**ユーザー名とパスワードが混ざって表示される**

---

<div class="poc">

## 🧪 PoC②：UNIONインジェクションをやってみよう

フォルダ：`02_union_based/`

```bash
cd 02_union_based && pip install -r requirements.txt && python app.py
# http://127.0.0.1:5002
```

1. `app.py` の検索（`LIKE`）部分の文字列結合を確認する
2. `%' UNION SELECT id, username, password FROM users --` で`users`テーブルを抽出 →**突破確認**
3. `app.py` をプレースホルダに書き換えてみる
4. 同じペイロードでヒット件数が0件になることを確認（答え合わせ：`secure_app.py`）

</div>

---

# 🎯 PoC②で理解してほしいこと

- 検索（`LIKE`）のように**値の一部を組み立てる処理**でも、文字列結合なら同じく危険
- `UNION SELECT` は「列数と型を合わせれば別テーブルの内容を差し込める」という仕組み
- プレースホルダに渡す値は `%keyword%` のように**組み立てた後の文字列でもよい**
  → 大事なのは「SQL文の構造」に手を加えられないようにすること

---

# エラーベースの補助テクニック

- DBがエラーメッセージをそのまま画面に返す設計だと、
  **エラー文からテーブル名・カラム名・DB種別が漏れる**
- 例：`' AND 1=CONVERT(int, (SELECT TOP 1 table_name FROM information_schema.tables)) --`
- カラム数の特定にも `ORDER BY 1,2,3...` を使ってエラーの有無で判定できる

<div class="warning">

⚠️ 本番環境で詳細なDBエラーを表示するのは**それ自体が情報漏洩**

</div>

---

# 5. 発展編：ブラインドSQLインジェクション

## 画面に結果が出ない場合はどうする？

エラーもデータも表示されない場合でも、
**真偽（Yes/No）の違い**さえ観測できれば情報を抜き出せる

- **Boolean-based**：レスポンスの違い（表示 or 非表示）で判定
- **Time-based**：応答時間の違い（遅延の有無）で判定

---

# Boolean-based Blind の例

正常な注文照会：

```sql
SELECT * FROM orders WHERE id = [入力]
```

真になる入力 → 結果が表示される：

```
1 AND 1=1
```

偽になる入力 → 結果が表示されない：

```
1 AND 1=2
```

この「表示/非表示」の差分を1文字ずつ繰り返すことで、
`SUBSTR()` などと組み合わせてDBの内容を**1文字ずつ確定**させられる

---

# Time-based Blind の例

画面に差が出ない場合は、**応答時間の差**を使う

```
1 AND (CASE WHEN (SUBSTR((SELECT password FROM users LIMIT 1),1,1)='a') THEN SLEEP(5) ELSE 0 END)
```

- 条件が真 → 5秒待たされる
- 条件が偽 → 即座に応答が返る

→ 画面に何も表示されなくても、**時間差だけで真偽が分かる**

---

<div class="poc">

## 🧪 PoC③：ブラインドSQLインジェクションをやってみよう

フォルダ：`03_blind_injection/`

```bash
cd 03_blind_injection && pip install -r requirements.txt && python app.py
# http://127.0.0.1:5003
```

1. `app.py` の数値パラメータの文字列結合部分を確認する
2. `/track?order_id=` に Boolean-based / Time-based の両方を試す →**突破確認**
3. `app.py` を `int()` チェック＋プレースホルダに書き換えてみる
4. 同じペイロードがエラーになり実行されないことを確認（答え合わせ：`secure_app.py`）

</div>

---

# 🎯 PoC③で理解してほしいこと

- 画面に何も表示されなくても、**Yes/No・応答時間の差**だけで情報を1文字ずつ抜き出せる
- 数値パラメータだからと `'` で囲まなくても、文字列結合であれば同じく危険
- 対策は「型を検証する」と「プレースホルダを使う」の**両方を組み合わせる**のが効果的

---

# 6. 発展編：スタック型SQLインジェクション

## Stacked Queries とは

1回のリクエストで**複数のSQL文をセミコロン区切りで連続実行**させる攻撃

```
note') ; DROP TABLE notes; --
```

- `SELECT` だけでなく `INSERT` / `UPDATE` / `DELETE` / `DROP` まで実行できてしまう
- ドライバや設定によって複数文実行が許可されている場合に成立する

---

# 発展編：セカンドオーダー SQLインジェクション

## 「今」ではなく「後で」爆発する攻撃

1. ユーザー登録時、ユーザー名は**プレースホルダで安全に保存**される
2. しかし別の機能（例：管理者向けレポート）が、
   **保存済みの値をそのまま文字列結合でSQLに使ってしまう**
3. 登録時には無害に見えた値が、**後から実行されるSQLで爆発する**

> 入力時点だけでなく、**値を使うすべての場所**で対策が必要という教訓

---

<div class="poc">

## 🧪 PoC④：スタック型 & セカンドオーダーをやってみよう

フォルダ：`04_advanced_second_order/`

```bash
cd 04_advanced_second_order && pip install -r requirements.txt && python app.py
# http://127.0.0.1:5004
```

1. `app.py` の `executescript()` と `/admin/report` の文字列結合部分を確認する
2. `/note` でスタック型、`/register`→`/admin/report` でセカンドオーダーを試す →**突破確認**
3. `app.py` を `execute()`＋プレースホルダに書き換えてみる（脆弱ポイントは2箇所）
4. 同じ手順で攻撃が通らなくなることを確認（答え合わせ：`secure_app.py`）

</div>

---

# 🎯 PoC④で理解してほしいこと

- 複数文を連続実行できる実装（`executescript()`等）は、
  `INSERT`だけを想定していても`DROP`/`UPDATE`まで実行されてしまう
- 「すでにDBに保存された値だから安全」という思い込みが**最も危険**
  → 対策は「入力を受け取る場所」だけでなく**値を使うすべての場所**に必要
- ここまでの4つのPoCは形は違うが、**根本原因はすべて同じ「文字列結合」**

---

# 7. 対策①：プレースホルダ（プリペアドステートメント）

## 最も重要かつ最も効果的な対策

```python
# 🚨 脆弱
query = f"SELECT * FROM users WHERE username = '{username}'"
cur.execute(query)

# ✅ 安全
cur.execute("SELECT * FROM users WHERE username = ?", (username,))
```

- 値は**SQL構文とは別チャンネル**でDBに渡される
- 入力に `'` や `--` が入っていても**単なる文字列として扱われる**

---

# 対策②：ORM / クエリビルダの活用

```python
# SQLAlchemy の例（内部でプレースホルダが使われる）
User.query.filter_by(username=username).first()
```

- 生SQLを手書きしない分、事故が起きにくい
- ただし `raw()` / `text()` などで**生SQLを書ける逃げ道**は残るので注意

---

# 対策③：入力値の検証・最小権限

## 入力値検証（バリデーション）

- 想定外の文字種・長さを拒否する（**多層防御の一つ**、これ単体では不十分）

## 最小権限の原則

- アプリ用DBユーザーに**必要最小限の権限**だけ与える
- `DROP` / `information_schema` への参照などは必要なければ禁止

## エラーメッセージ

- 本番環境では**詳細なDBエラーを画面に出さない**

---

# 対策④：多層防御（Defense in Depth）

| 層 | 対策 |
|---|---|
| コード | プレースホルダ / ORM |
| DB | 最小権限アカウント、ストアドプロシージャ |
| ネットワーク | WAF による既知パターンの検知・遮断 |
| 運用 | ログ監視、依存ライブラリの更新、定期的な脆弱性診断 |

**「1つ対策すれば終わり」ではなく、複数の層を重ねる**

---

# まとめ

| フェーズ | 手法 | 対策 |
|---|---|---|
| 基本 | ログインバイパス / UNION | プレースホルダ |
| 発展 | ブラインド（Boolean/Time） | 詳細エラー非表示・最小権限 |
| 発展 | スタック型・セカンドオーダー | 使う場所すべてでプレースホルダ |
| 全体 | — | 多層防御・入力値検証・WAF・監視 |

SQLインジェクションは**古典的だが今も現役**の脆弱性。
「どこかで文字列結合していないか」を常に疑う姿勢が最大の防御。

---

# 参考リンク

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [PortSwigger Web Security Academy - SQL injection](https://portswigger.net/web-security/sql-injection)

---

# Q&A

ご質問はありますか？

配布したサンドボックスは、講座終了後もローカルで復習に使ってください。
