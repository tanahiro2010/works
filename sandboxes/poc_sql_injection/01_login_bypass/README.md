# PoC①: ログインバイパス

もっとも基本的なSQLインジェクション。文字列結合でSQLを組み立てているログイン処理を、
`' OR '1'='1'` のようなペイロードで突破する。

```bash
pip install -r requirements.txt
python app.py
# http://127.0.0.1:5001
```

## Step 1: 脆弱なコードを読む

`app.py` の該当部分：

```python
query = (
    "SELECT * FROM users WHERE username = '"
    + username
    + "' AND password = '"
    + password
    + "'"
)
```

ユーザー名・パスワードを**そのまま文字列結合**でSQLに埋め込んでいる。
入力に `'` が含まれるとどうなるか、実行前に予想してみよう。

## Step 2: 攻撃してみる

| ユーザー名 | パスワード | 結果 |
|---|---|---|
| `admin` | `wrongpassword` | ログイン失敗（通常の動作） |
| `admin' --` | 何でもよい（空欄でOK） | ✅ パスワード条件がコメントアウトされログイン成功 |
| `' OR '1'='1' --` | 空欄でOK | ✅ 条件が常に真になり最初のユーザーでログイン |
| `nonexistent' UNION SELECT 1,'admin','x','admin' --` | 空欄でOK | ✅ 存在しないユーザー名でも偽装データでログイン |

画面下部に**実際に実行されたSQL文**が表示されるので、
入力がどのようにSQLへ混ざっているかを確認しながら試してみてください。

## ZAPで見るポイント

- `/` のログインフォームをSpider/Active Scan対象にする
- AlertsでSQL Injectionの有無、Historyで送信されたusername/passwordを確認する
- ZAPのAlertだけで終わらず、`admin' --` を手入力してログイン突破を再現する

## Step 3: 自分で修正する

`app.py` の文字列結合部分を、プレースホルダ（`?`）を使う形に書き換えてみよう。

```python
# 書き換え後のイメージ（値は tuple で渡す）
query = "SELECT * FROM users WHERE username = ? AND password = ?"
cur.execute(query, (username, password))
```

`cur.execute(query)` → `cur.execute(query, (username, password))` に変える必要がある点に注意。

## Step 4: 再攻撃して防御を確認する

Step 2 と同じペイロードを打ち込んで、**ログインが失敗することを確認**しよう。

```
ユーザー名: admin' --
パスワード: （空欄）
→ 修正前: ログイン成功 / 修正後: ログイン失敗
```

## 答え合わせ

```bash
python secure_app.py
# http://127.0.0.1:5011
```

自分の修正と `secure_app.py` を見比べてみよう。

## 🎯 理解してほしいこと

- 文字列結合だと、入力に含まれる `'` が**SQLの構文の一部として解釈**されてしまう
  → `--` でコメントアウトしたり `OR '1'='1'` で条件を書き換えたりできる
- プレースホルダ（`?`）を使うと、入力値は**常に「単なる値」として渡される**
  → `'` や `--` を含んでいても、SQLの構文としては解釈されない
- 「入力を検証する」よりも「そもそも構文に混ざらない書き方をする」方が確実
