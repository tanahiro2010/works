"""
PoC⑤: MySQLを使ったUNION SQLインジェクション（脆弱版）

Docker Composeで起動する実DB版。商品検索のLIKE条件を文字列結合しているため、
UNION SELECTでcustomersテーブルの架空顧客情報を検索結果に混ぜて表示できる。
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
<h2>商品検索（MySQL脆弱版 / PoC⑤）</h2>
<p>ローカル教材用です。ZAPでは http://127.0.0.1:5005/ を対象にしてください。</p>
<form method="get">
  検索キーワード: <input name="q" size="80" value="{{ q }}"><br><br>
  <button type="submit">検索</button>
</form>
{% if rows is not none %}
<table border="1" cellpadding="6">
  <tr><th>ID</th><th>名前または漏洩データ</th><th>価格または金額</th></tr>
  {% for row in rows %}
  <tr><td>{{ row[0] }}</td><td>{{ row[1] }}</td><td>{{ row[2] }}</td></tr>
  {% endfor %}
</table>
{% endif %}
{% if error %}<p><b>SQLエラー:</b> {{ error }}</p>{% endif %}
{% if sql %}<pre>実行されたSQL:\n{{ sql }}</pre>{% endif %}
<hr>
<p>例: <code>zzz%' UNION SELECT id, email, last_order_total FROM customers -- </code></p>
<p>MySQLでは <code>--</code> の後ろに空白が必要です。</p>
"""


@app.route("/", methods=["GET"])
def search():
    q = request.args.get("q", "")
    rows = None
    error = None
    sql = ""

    if q != "" or "q" in request.args:
        sql = "SELECT id, name, price FROM products WHERE name LIKE '%" + q + "%'"
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(sql)
                rows = cur.fetchall()
        except pymysql.MySQLError as exc:
            error = str(exc)
        finally:
            conn.close()

    return render_template_string(PAGE, q=q, rows=rows, error=error, sql=sql)


if __name__ == "__main__":
    port = int(os.environ.get("APP_PORT", "5005"))
    app.run(host="0.0.0.0", debug=True, port=port)
