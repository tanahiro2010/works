"""
PoC③: ブラインドSQLインジェクション（脆弱版）

注文番号の照会フォームは「見つかりました / 見つかりません」しか表示しないが、
これだけの情報（Boolean）や応答時間（Time-based）を使ってDBの内容を1文字ずつ抜き出せる。

SQLite本体には SLEEP() 関数が存在しないため、学習用に Python の time.sleep を
SQL関数として登録し、MySQLのSLEEP()を再現している。

学習目的専用。127.0.0.1 でのみ動かすこと。
"""
import os
import sqlite3
import time

from flask import Flask, render_template_string, request

DB_PATH = os.path.join(os.path.dirname(__file__), "vuln.db")


def sleep_seconds(seconds):
    try:
        s = min(float(seconds), 10.0)  # 講義用に最大10秒でキャップ
    except (TypeError, ValueError):
        s = 0
    time.sleep(max(s, 0))
    return 0


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.create_function("SLEEP", 1, sleep_seconds)
    return conn


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
<h2>注文照会（脆弱版 / PoC③）</h2>
<form method="get">
  注文ID: <input name="order_id" size="60" value="{{ order_id }}"><br><br>
  <button type="submit">照会</button>
</form>
{% if result is not none %}
  <p><b>{{ result }}</b></p>
{% endif %}
{% if elapsed is not none %}
  <p>応答時間: {{ "%.2f"|format(elapsed) }} 秒</p>
{% endif %}
{% if sql %}<pre>実行されたSQL:\n{{ sql }}</pre>{% endif %}
"""


@app.route("/track", methods=["GET"])
def track():
    order_id = request.args.get("order_id", "")
    result = None
    elapsed = None
    sql = ""

    if order_id != "":
        # 🚨 脆弱ポイント: 数値パラメータでも引用符なしで文字列結合している
        query = "SELECT item, status FROM orders WHERE id = " + order_id
        sql = query

        conn = get_conn()
        cur = conn.cursor()
        start = time.time()
        try:
            cur.execute(query)
            row = cur.fetchone()
        except sqlite3.Error as e:
            row = None
            result = f"SQLエラー: {e}"
        elapsed = time.time() - start
        conn.close()

        if result is None:
            result = f"見つかりました: {row[0]} ({row[1]})" if row else "見つかりません"

    return render_template_string(PAGE, order_id=order_id, result=result, elapsed=elapsed, sql=sql)


@app.route("/")
def index():
    return (
        '<h2>PoC③ ブラインドSQLインジェクション</h2>'
        '<p><a href="/track?order_id=1">/track?order_id=1</a> から試してください</p>'
    )


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5003)
