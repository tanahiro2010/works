"""
PoC⑤: MySQLを使ったUNION SQLインジェクション（修正版）

LIKE検索でもプレースホルダを使い、詳細なSQLエラーを画面に返さない。
"""
import os
import time

import pymysql
from flask import Flask, render_template_string, request


def get_conn():
    for _ in range(30):
        try:
            return pymysql.connect(
                host=os.environ.get("MYSQL_HOST", "127.0.0.1"),
                user=os.environ.get("MYSQL_USER", "appuser"),
                password=os.environ.get("MYSQL_PASSWORD", "apppass"),
                database=os.environ.get("MYSQL_DATABASE", "training"),
                charset="utf8mb4",
                cursorclass=pymysql.cursors.Cursor,
            )
        except pymysql.MySQLError:
            time.sleep(1)
    raise RuntimeError("MySQL is not ready")


app = Flask(__name__)

PAGE = """
<h2>商品検索（MySQL修正版 / PoC⑤）</h2>
<form method="get">
  検索キーワード: <input name="q" size="80" value="{{ q }}"><br><br>
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
{% if error %}<p><b>{{ error }}</b></p>{% endif %}
"""


@app.route("/", methods=["GET"])
def search():
    q = request.args.get("q", "")
    rows = None
    error = None

    if q != "" or "q" in request.args:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, price FROM products WHERE name LIKE %s",
                    ("%" + q + "%",),
                )
                rows = cur.fetchall()
        except pymysql.MySQLError:
            error = "検索に失敗しました"
        finally:
            conn.close()

    return render_template_string(PAGE, q=q, rows=rows, error=error)


if __name__ == "__main__":
    port = int(os.environ.get("APP_PORT", "5015"))
    app.run(host="0.0.0.0", debug=True, port=port)
