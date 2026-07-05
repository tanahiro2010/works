"""
PoC①: ログインバイパス（脆弱版）

ユーザー入力を文字列結合でSQLに埋め込んでいるため、
' OR '1'='1' -- のようなペイロードで認証を回避できる。

学習目的専用。127.0.0.1 でのみ動かすこと。
"""
import os
import sqlite3

from flask import Flask, render_template_string, request

DB_PATH = os.path.join(os.path.dirname(__file__), "vuln.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DROP TABLE IF EXISTS users")
    conn.execute(
        "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)"
    )
    conn.executemany(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [
            ("admin", "S3cretAdminPass!", "admin"),
            ("alice", "alicepw123", "user"),
        ],
    )
    conn.commit()
    conn.close()


app = Flask(__name__)

PAGE = """
<h2>ログイン（脆弱版 / PoC①）</h2>
<form method="post">
  ユーザー名: <input name="username" size="40"><br><br>
  パスワード: <input name="password" type="password" size="40"><br><br>
  <button type="submit">ログイン</button>
</form>
{% if message %}<p><b>{{ message }}</b></p>{% endif %}
{% if sql %}<pre>実行されたSQL:\n{{ sql }}</pre>{% endif %}
<hr>
<p><a href="/">最初からやり直す</a></p>
"""


@app.route("/", methods=["GET", "POST"])
def login():
    message = ""
    sql = ""
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")

        # 🚨 脆弱ポイント: 文字列結合でSQLを組み立てている
        query = (
            "SELECT * FROM users WHERE username = '"
            + username
            + "' AND password = '"
            + password
            + "'"
        )
        sql = query

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        try:
            cur.execute(query)
            row = cur.fetchone()
        except sqlite3.Error as e:
            row = None
            message = f"SQLエラー: {e}"
        conn.close()

        if row:
            message = f"ログイン成功！ こんにちは {row[1]} さん（role: {row[3]}）"
        elif not message:
            message = "ログイン失敗"

    return render_template_string(PAGE, message=message, sql=sql)


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5001)
