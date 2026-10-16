"""
PoC②: UNIONベースのSQLインジェクション（脆弱版）

商品検索フォームが文字列結合でSQLを組み立てているため、
UNION SELECT を使って users テーブルの内容を検索結果に混ぜて抜き出せる。

学習目的専用。127.0.0.1 でのみ動かすこと。
"""
import os
import sqlite3

from flask import Flask, render_template_string, request

DB_PATH = os.path.join(os.path.dirname(__file__), "vuln.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DROP TABLE IF EXISTS products")
    conn.execute("DROP TABLE IF EXISTS users")
    conn.execute("DROP TABLE IF EXISTS customers")
    conn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER)")
    conn.execute(
        "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)"
    )
    conn.execute(
        """
        CREATE TABLE customers (
            id INTEGER PRIMARY KEY,
            email TEXT,
            phone TEXT,
            last_order_total INTEGER
        )
        """
    )
    conn.executemany(
        "INSERT INTO products (name, price) VALUES (?, ?)",
        [
            ("ノートPC", 89800),
            ("ワイヤレスマウス", 2980),
            ("USB-Cハブ", 4980),
            ("メカニカルキーボード", 12800),
        ],
    )
    conn.executemany(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [
            ("admin", "S3cretAdminPass!", "admin"),
            ("alice", "alicepw123", "user"),
        ],
    )
    conn.executemany(
        "INSERT INTO customers (email, phone, last_order_total) VALUES (?, ?, ?)",
        [
            ("sato.customer@example.test", "090-1111-2222", 128000),
            ("suzuki.customer@example.test", "080-3333-4444", 54800),
            ("takahashi.customer@example.test", "070-5555-6666", 23900),
        ],
    )
    conn.commit()
    conn.close()


app = Flask(__name__)

PAGE = """
<h2>商品検索（脆弱版 / PoC②）</h2>
<form method="get">
  検索キーワード: <input name="q" size="50" value="{{ q }}"><br><br>
  <button type="submit">検索</button>
</form>
{% if rows is not none %}
<table border="1" cellpadding="6">
  <tr><th>ID</th><th>名前</th><th>価格</th></tr>
  {% for row in rows %}
  <tr><td>{{ row[0] }}</td><td>{{ row[1] }}</td><td>{{ row[2] }}</td></tr>
  {% endfor %}
</table>
{% endif %}
{% if error %}<p><b>SQLエラー:</b> {{ error }}</p>{% endif %}
{% if sql %}<pre>実行されたSQL:\n{{ sql }}</pre>{% endif %}
"""


@app.route("/", methods=["GET"])
def search():
    q = request.args.get("q", "")
    rows = None
    error = None
    sql = ""

    if q != "" or "q" in request.args:
        # 🚨 脆弱ポイント: 文字列結合でSQLを組み立てている
        query = "SELECT id, name, price FROM products WHERE name LIKE '%" + q + "%'"
        sql = query

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        try:
            cur.execute(query)
            rows = cur.fetchall()
        except sqlite3.Error as e:
            error = str(e)
        conn.close()

    return render_template_string(PAGE, q=q, rows=rows, error=error, sql=sql)


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5002)
