"""
PoC④: スタック型 & セカンドオーダー SQLインジェクション（脆弱版）

1. /note            : executescript() で複数SQL文を連続実行できてしまう（スタック型）
2. /register + /admin/report : 登録時は安全でも、後から使う場所が脆弱だと爆発する（セカンドオーダー）

学習目的専用。127.0.0.1 でのみ動かすこと。
"""
import os
import sqlite3

from flask import Flask, redirect, render_template_string, request, url_for

DB_PATH = os.path.join(os.path.dirname(__file__), "vuln.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DROP TABLE IF EXISTS notes")
    conn.execute("DROP TABLE IF EXISTS users_ext")
    conn.execute("DROP TABLE IF EXISTS logs")
    conn.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, text TEXT)")
    conn.execute("CREATE TABLE users_ext (id INTEGER PRIMARY KEY, username TEXT)")
    conn.execute("CREATE TABLE logs (id INTEGER PRIMARY KEY, username TEXT, action TEXT)")
    conn.executemany("INSERT INTO notes (text) VALUES (?)", [("最初のメモ",), ("買い物リスト",)])
    conn.executemany(
        "INSERT INTO logs (username, action) VALUES (?, ?)",
        [
            ("alice", "ログイン成功"),
            ("alice", "商品を購入した"),
            ("admin", "ユーザー一覧を閲覧した"),
            ("admin", "管理画面から secret-api-key を発行した"),
        ],
    )
    conn.commit()
    conn.close()


app = Flask(__name__)

NOTE_PAGE = """
<h2>メモ登録（脆弱版 / PoC④ スタック型）</h2>
<form method="post">
  メモ: <input name="text" size="60"><br><br>
  <button type="submit">登録</button>
</form>
<h3>メモ一覧</h3>
<ul>
{% for n in notes %}<li>{{ n }}</li>{% endfor %}
</ul>
{% if error %}<p><b>エラー:</b> {{ error }}</p>{% endif %}
{% if sql %}<pre>実行されたSQL:\n{{ sql }}</pre>{% endif %}
<hr>
<p><a href="{{ url_for('register') }}">→ セカンドオーダーPoCへ</a></p>
"""


@app.route("/note", methods=["GET", "POST"])
def note():
    error = None
    sql = ""
    conn = sqlite3.connect(DB_PATH)
    if request.method == "POST":
        text = request.form.get("text", "")
        # 🚨 脆弱ポイント: executescript は「;」区切りで複数文を連続実行できてしまう
        query = f"INSERT INTO notes (text) VALUES ('{text}')"
        sql = query
        try:
            conn.executescript(query)
            conn.commit()
        except sqlite3.Error as e:
            error = str(e)

    try:
        notes = [row[0] for row in conn.execute("SELECT text FROM notes").fetchall()]
    except sqlite3.Error as e:
        notes = []
        error = error or str(e)
    conn.close()

    return render_template_string(NOTE_PAGE, notes=notes, error=error, sql=sql)


REGISTER_PAGE = """
<h2>ユーザー登録（セカンドオーダー PoC）</h2>
<form method="post">
  ユーザー名: <input name="username" size="60"><br><br>
  <button type="submit">登録</button>
</form>
{% if new_id %}<p>登録しました。ID = {{ new_id }}（このIDでレポートを見てみよう）</p>{% endif %}
<hr>
<p><a href="{{ url_for('admin_report') }}">→ 管理者レポートを見る（user_id を指定）</a></p>
<p><a href="{{ url_for('note') }}">← スタック型PoCへ戻る</a></p>
"""


@app.route("/register", methods=["GET", "POST"])
def register():
    new_id = None
    if request.method == "POST":
        username = request.form.get("username", "")
        # この時点は ✅ プレースホルダを使っているので安全に見える
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("INSERT INTO users_ext (username) VALUES (?)", (username,))
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
    return render_template_string(REGISTER_PAGE, new_id=new_id)


REPORT_PAGE = """
<h2>管理者レポート（脆弱版）</h2>
<form method="get">
  user_id: <input name="user_id" size="10" value="{{ user_id }}"><br><br>
  <button type="submit">レポート表示</button>
</form>
{% if stored_username is not none %}
  <p>登録済みユーザー名: <code>{{ stored_username }}</code></p>
{% endif %}
{% if rows is not none %}
<table border="1" cellpadding="6">
  <tr><th>username</th><th>action</th></tr>
  {% for row in rows %}<tr><td>{{ row[0] }}</td><td>{{ row[1] }}</td></tr>{% endfor %}
</table>
{% endif %}
{% if sql %}<pre>実行されたSQL:\n{{ sql }}</pre>{% endif %}
{% if error %}<p><b>エラー:</b> {{ error }}</p>{% endif %}
"""


@app.route("/admin/report", methods=["GET"])
def admin_report():
    user_id = request.args.get("user_id", "")
    stored_username = None
    rows = None
    sql = ""
    error = None

    if user_id != "":
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        # ここは安全にユーザー名を取得する（プレースホルダ使用）
        cur.execute("SELECT username FROM users_ext WHERE id = ?", (user_id,))
        row = cur.fetchone()

        if row:
            stored_username = row[0]
            # 🚨 脆弱ポイント: 「すでにDBに保存された値だから安全」と思い込み、
            #     ここで再び文字列結合してしまう（セカンドオーダー）
            query = f"SELECT username, action FROM logs WHERE username = '{stored_username}'"
            sql = query
            try:
                cur.execute(query)
                rows = cur.fetchall()
            except sqlite3.Error as e:
                error = str(e)
        conn.close()

    return render_template_string(
        REPORT_PAGE, user_id=user_id, stored_username=stored_username, rows=rows, sql=sql, error=error
    )


@app.route("/")
def index():
    return redirect(url_for("note"))


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5004)
