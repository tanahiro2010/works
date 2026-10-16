"""
PoC③: ブラインドSQLインジェクション（修正版）

数値パラメータであっても、必ずプレースホルダで渡す。
さらにサーバー側で int() にキャストすることで、そもそも数値以外を受け付けない。
"""
import os
import sqlite3
import time

from flask import Flask, render_template_string, request

DB_PATH = os.path.join(os.path.dirname(__file__), "vuln.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DROP TABLE IF EXISTS orders")
    conn.execute("DROP TABLE IF EXISTS users")
    conn.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, item TEXT, status TEXT)")
    conn.execute(
        "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)"
    )
    conn.executemany(
        "INSERT INTO orders (item, status) VALUES (?, ?)",
        [
            ("ノートPC", "発送済み"),
            ("ワイヤレスマウス", "準備中"),
            ("USB-Cハブ", "配達完了"),
        ],
    )
    conn.executemany(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [
            ("admin", "Sup3rSecretPw", "admin"),
            ("alice", "alicepw123", "user"),
        ],
    )
    conn.commit()
    conn.close()


app = Flask(__name__)

PAGE = """
<h2>注文照会（修正版）</h2>
<form method="get">
  注文ID: <input name="order_id" size="60" value="{{ order_id }}"><br><br>
  <button type="submit">照会</button>
</form>
{% if result is not none %}
  <p><b>{{ result }}</b></p>
{% endif %}
"""


@app.route("/track", methods=["GET"])
def track():
    order_id_raw = request.args.get("order_id", "")
    result = None

    if order_id_raw != "":
        # ✅ 修正ポイント①: 型を検証する（数値以外は受け付けない）
        # ✅ 修正ポイント②: プレースホルダを使う
        try:
            order_id = int(order_id_raw)
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("SELECT item, status FROM orders WHERE id = ?", (order_id,))
            row = cur.fetchone()
            conn.close()
            result = f"見つかりました: {row[0]} ({row[1]})" if row else "見つかりません"
        except ValueError:
            result = "注文IDは数値で入力してください"

    return render_template_string(PAGE, order_id=order_id_raw, result=result)


@app.route("/")
def index():
    return (
        '<h2>PoC③ 修正版</h2>'
        '<p><a href="/track?order_id=1">/track?order_id=1</a> から試してください</p>'
    )


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5013)
