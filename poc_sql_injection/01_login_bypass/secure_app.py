"""
PoC①: ログインバイパス（修正版）

プレースホルダ（?）を使うことで、入力値がSQL構文として解釈されなくなる。
app.py と同じペイロードを打ち込んで、突破できないことを確認しよう。
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
<h2>ログイン（修正版）</h2>
<form method="post">
  ユーザー名: <input name="username" size="40"><br><br>
  パスワード: <input name="password" type="password" size="40"><br><br>
  <button type="submit">ログイン</button>
</form>
{% if message %}<p><b>{{ message }}</b></p>{% endif %}
<hr>
<p><a href="/">最初からやり直す</a></p>
"""


@app.route("/", methods=["GET", "POST"])
def login():
    message = ""
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")

        # ✅ 修正ポイント: プレースホルダを使う
        query = "SELECT * FROM users WHERE username = ? AND password = ?"

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute(query, (username, password))
        row = cur.fetchone()
        conn.close()

        if row:
            message = f"ログイン成功！ こんにちは {row[1]} さん（role: {row[3]}）"
        else:
            message = "ログイン失敗"

    return render_template_string(PAGE, message=message)


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5011)
