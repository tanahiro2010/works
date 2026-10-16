# PoC④: スタック型 & セカンドオーダー SQLインジェクション

このフォルダには2つのシナリオが入っています。脆弱ポイントは2箇所（`/note` と
`/admin/report`）あるので、両方を修正してから Step 4 に進んでください。

```bash
pip install -r requirements.txt
python app.py
# http://127.0.0.1:5004
```

---

## シナリオA: スタック型（Stacked Queries）— `/note`

### Step 1: 脆弱なコードを読む

```python
query = f"INSERT INTO notes (text) VALUES ('{text}')"
conn.executescript(query)   # ← ; 区切りで複数文を実行できてしまう
```

`execute()` ではなく `executescript()` を使っている点に注目しよう。

### ZAPで見るポイント

- `/note` のPOSTリクエストをHistoryで確認する
- 複数文実行や改ざん系は、自動検出より手動確認の方が分かりやすい
- 講義ではまず破壊的でない `UPDATE` で確認し、`DROP TABLE` は挙動説明に留めるか短時間だけ実演する

### Step 2: 攻撃してみる

破壊的でない確認用（既存メモを改ざんする）：

```
x'); UPDATE notes SET text='HACKED by injection' WHERE id=1; --
```

→ メモ一覧の1件目が `HACKED by injection` に書き換わる

破壊的な例（テーブルそのものを消す）：

```
x'); DROP TABLE notes; --
```

→ `notes` テーブルが消え、以降このページはエラーになる
（`python app.py` を再起動すればDBは初期化されて元に戻ります）

### Step 3: 自分で修正する

`executescript()` を `execute()` ＋プレースホルダに書き換えてみよう。

```python
# 書き換え後のイメージ
conn.execute("INSERT INTO notes (text) VALUES (?)", (text,))
```

`execute()` は1文しか実行できないため、`;` で複数文をつなげても無意味になる。

### Step 4: 再攻撃して防御を確認する

Step 2 のペイロードを試して、メモがそのまま**1件の文字列として登録される**
（改ざん・削除が起きない）ことを確認しよう。

---

## シナリオB: セカンドオーダー SQLインジェクション

「登録時は安全なコードでも、後で別の場所が脆弱だと爆発する」ことを体験する。

### Step 1: 脆弱なコードを読む

```python
# stored_username は「すでにDBにある値だから安全」という思い込みで文字列結合している
query = f"SELECT username, action FROM logs WHERE username = '{stored_username}'"
```

一方 `/register` 側は `cur.execute("INSERT INTO users_ext (username) VALUES (?)", (username,))`
とプレースホルダを使っている。**登録時は安全なのに、なぜ危険なのか**を予想してみよう。

### Step 2: 攻撃してみる

1. `/register` にアクセスし、ユーザー名に以下を入力して登録する

   ```
   nobody' OR '1'='1' --
   ```

   → この時点ではプレースホルダを使っているので**何も起こらない**。
   正常にそのまま文字列として `users_ext` テーブルに保存される。

2. 発行された `user_id` を確認する

3. `/admin/report?user_id=<発行されたID>` にアクセスする

→ 本来は登録したユーザー名に対応するログしか出ないはずが、
`OR '1'='1'` によって**全ユーザーのログ（adminの操作ログを含む）が丸ごと表示される**

### Step 3: 自分で修正する

`/admin/report` の文字列結合部分をプレースホルダに書き換えてみよう。

```python
# 書き換え後のイメージ
cur.execute("SELECT username, action FROM logs WHERE username = ?", (stored_username,))
```

「DBから取り出した値だから安全」ではなく、**SQLに使う時点で毎回対策する**という考え方。

### Step 4: 再攻撃して防御を確認する

Step 2 と同じ手順（`nobody' OR '1'='1' --` で登録 →`/admin/report`）を試して、
**該当ユーザーのログが0件になる**ことを確認しよう。

---

## 答え合わせ

```bash
python secure_app.py
# http://127.0.0.1:5014
```

- `/note` は `execute()` + プレースホルダになり、`;` 区切りの複数文は実行できない
- `/admin/report` も、値を**使う場所**でプレースホルダを使うことで、
  「安全に保存された値」を信用せずに済むようになる

## 🎯 理解してほしいこと

- 複数文を連続実行できる実装（`executescript()`等）は、
  `INSERT`だけを想定していても`DROP`/`UPDATE`まで実行されてしまう
- 「すでにDBに保存された値だから安全」という思い込みが**最も危険**
  → 対策は「入力を受け取る場所」だけでなく**値を使うすべての場所**に必要
- ここまでの4つのPoCは形は違うが、根本原因はすべて同じ「文字列結合でSQLを組み立てる」こと
