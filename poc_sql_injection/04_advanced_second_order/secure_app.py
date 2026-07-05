"""
PoC④: スタック型 & セカンドオーダー SQLインジェクション（修正版）

- /note        : execute() + プレースホルダ（複数文の連続実行ができなくなる）
- /admin/report: 「保存済みの値」であっても使う場所でプレースホルダを使う
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
<h2>メモ登録（修正版）</h2>
<form method="post">
  メモ: <input name="text" size="60"><br><br>
  <button type="submit">登録</button>
</form>
<h3>メモ一覧</h3>
<ul>
{% for n in notes %}<li>{{ n }}</li>{% endfor %}
</ul>
{% if error %}<p><b>エラー:</b> {{ error }}</p>{% endif %}
<hr>
<p><a href="{{ url_for('register') }}">→ セカンドオーダーPoCへ</a></p>
"""


@app.route("/note", methods=["GET", "POST"])
def note():
    error = None
    conn = sqlite3.connect(DB_PATH)
    if request.method == "POST":
        text = request.form.get("text", "")
        # ✅ 修正ポイント: execute() + プレースホルダ。複数文を混ぜても1つの値として扱われる
        try:
            conn.execute("INSERT INTO notes (text) VALUES (?)", (text,))
            conn.commit()
        except sqlite3.Error as e:
            error = str(e)

    notes = [row[0] for row in conn.execute("SELECT text FROM notes").fetchall()]
    conn.close()

    return render_template_string(NOTE_PAGE, notes=notes, error=error)


REGISTER_PAGE = """
<h2>ユーザー登録（修正版）</h2>
<form method="post">
  ユーザー名: <input name="username" size="60"><br><br>
  <button type="submit">登録</button>
</form>
{% if new_id %}<p>登録しました。ID = {{ new_id }}</p>{% endif %}
<hr>
<p><a href="{{ url_for('admin_report') }}">→ 管理者レポートを見る（user_id を指定）</a></p>
<p><a href="{{ url_for('note') }}">← スタック型PoCへ戻る</a></p>
"""


@app.route("/register", methods=["GET", "POST"])
def register():
    new_id = None
    if request.method == "POST":
        username = request.form.get("username", "")
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("INSERT INTO users_ext (username) VALUES (?)", (username,))
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
    return render_template_string(REGISTER_PAGE, new_id=new_id)


REPORT_PAGE = """
<h2>管理者レポート（修正版）</h2>
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
"""


@app.route("/admin/report", methods=["GET"])
def admin_report():
    user_id = request.args.get("user_id", "")
    stored_username = None
    rows = None

    if user_id != "":
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT username FROM users_ext WHERE id = ?", (user_id,))
        row = cur.fetchone()

        if row:
            stored_username = row[0]
            # ✅ 修正ポイント: 「保存済みの値だから安全」と思い込まず、使う場所でも必ずプレースホルダ
            cur.execute(
                "SELECT username, action FROM logs WHERE username = ?", (stored_username,)
            )
            rows = cur.fetchall()
        conn.close()

    return render_template_string(
        REPORT_PAGE, user_id=user_id, stored_username=stored_username, rows=rows
    )


@app.route("/")
def index():
    return redirect(url_for("note"))


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5014)
