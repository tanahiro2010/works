# PoC③: ブラインドSQLインジェクション

画面には「見つかりました / 見つかりません」しか表示されないが、
Boolean-basedとTime-basedの2種類の手法で `users` テーブルの内容を抜き出す。

```bash
pip install -r requirements.txt
python app.py
# http://127.0.0.1:5003/track?order_id=1
```

## Step 1: 脆弱なコードを読む

`app.py` の該当部分：

```python
query = "SELECT item, status FROM orders WHERE id = " + order_id
```

数値パラメータだからと引用符（`'`）で囲んでいないため、そのままSQL構文として解釈される。
「引用符で囲まれていなければ安全」ではないことに注目しよう。

## Step 2: 攻撃してみる

### 2-1. Boolean-based Blind

まず正常系：

```
order_id=1         → 見つかりました
order_id=999        → 見つかりません
```

真偽で分岐させる：

```
order_id=1 AND 1=1   → 見つかりました
order_id=1 AND 1=2   → 見つかりません
```

`users` テーブルの中身を1文字ずつ確認する：

```
order_id=1 AND (SELECT SUBSTR(password,1,1) FROM users WHERE username='admin') = 'S'
```

→ 表示が「見つかりました」になれば、`admin` のパスワードの1文字目は `S` と確定する。
文字を総当たりし、位置（`SUBSTR(password, 2, 1)` …）を増やしていけば全文字が分かる。

### 2-2. Time-based Blind

画面の見た目に頼らず、**応答時間**で判定する：

```
order_id=1 AND (CASE WHEN (SELECT SUBSTR(password,1,1) FROM users WHERE username='admin')='S' THEN SLEEP(3) ELSE 0 END)
```

→ 条件が真なら応答が約3秒遅れる（ページに応答時間を表示しています）。
条件が偽ならすぐに応答が返ることを比較してみよう。

<small>※ SQLiteに本来 `SLEEP()` は存在しません。学習用に `app.py` 内で Python の
`time.sleep` をSQL関数として登録し、MySQL等での挙動を再現しています。</small>

### 2-3. 自動抽出デモ

手作業で1文字ずつ確認する流れを理解したあと、ローカルPoC専用スクリプトで同じ作業を自動化する。

```bash
python extract_password.py
```

→ `admin` のパスワードが1文字ずつ確定していく。ZAPやスキャナが「脆弱性あり」と示すだけでなく、
攻撃者が実際に情報を復元できることを短時間で見せるためのデモ。

## ZAPで見るポイント

- `/track?order_id=1` を対象にSpider/Active Scanを実行する
- Boolean-basedはレスポンス本文の違い、Time-basedは応答時間の違いが証拠になる
- 自動検出が弱い場合もあるため、Requesterやブラウザで手動ペイロードを試して確認する

## Step 3: 自分で修正する

`app.py` を、型を検証してからプレースホルダで渡す形に書き換えてみよう。

```python
# 書き換え後のイメージ
order_id = int(order_id_raw)   # 数値以外は ValueError になる
cur.execute("SELECT item, status FROM orders WHERE id = ?", (order_id,))
```

`int()` への変換と `try/except ValueError` の両方が必要になる点に注意。

## Step 4: 再攻撃して防御を確認する

Step 2 のペイロード（`1 AND 1=1` など）を試して、
**数値変換の時点でエラーになりSQLとして実行されない**ことを確認しよう。

## 答え合わせ

```bash
python secure_app.py
# http://127.0.0.1:5013
```

## 🎯 理解してほしいこと

- 画面に何も表示されなくても、**Yes/No・応答時間の差**だけで情報を1文字ずつ抜き出せる
- 数値パラメータだからと `'` で囲まなくても、文字列結合であれば同じく危険
- 対策は「型を検証する」と「プレースホルダを使う」の**両方を組み合わせる**のが効果的
  （型検証だけでは、検証をすり抜ける入力があれば防げない）
