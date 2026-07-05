"""
PoC⑦: Black-box injection challenge

講義の総合演習用。コードを読まず、ZAP・ブラウザ・curlで脆弱ポイントを探す。
すべてローカルDocker環境の架空データだけを対象にする。
"""
import json
import os
import time

import pymysql
from flask import Flask, jsonify, redirect, render_template_string, request, url_for
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from pymysql.constants import CLIENT


MYSQL_CONFIG = {
    "host": os.environ.get("MYSQL_HOST", "127.0.0.1"),
    "user": os.environ.get("MYSQL_USER", "appuser"),
    "password": os.environ.get("MYSQL_PASSWORD", "apppass"),
    "database": os.environ.get("MYSQL_DATABASE", "training"),
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.Cursor,
}
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://127.0.0.1:27017")


def mysql_conn(multi=False):
    config = dict(MYSQL_CONFIG)
    if multi:
        config["client_flag"] = CLIENT.MULTI_STATEMENTS
    for _ in range(30):
        try:
            return pymysql.connect(**config)
        except pymysql.MySQLError:
            time.sleep(1)
    raise RuntimeError("MySQL is not ready")


def mongo_db():
    for _ in range(30):
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1000)
            client.admin.command("ping")
            return client.challenge_training
        except PyMongoError:
            time.sleep(1)
    raise RuntimeError("MongoDB is not ready")


def seed_mysql():
    conn = mysql_conn()
    statements = [
        "DROP TABLE IF EXISTS challenge_logs",
        "DROP TABLE IF EXISTS challenge_profiles",
        "DROP TABLE IF EXISTS challenge_notes",
        "DROP TABLE IF EXISTS challenge_orders",
        "DROP TABLE IF EXISTS challenge_customers",
        "DROP TABLE IF EXISTS challenge_products",
        "DROP TABLE IF EXISTS challenge_users",
        """
        CREATE TABLE challenge_users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(100) NOT NULL,
            password VARCHAR(100) NOT NULL,
            role VARCHAR(40) NOT NULL
        )
        """,
        """
        CREATE TABLE challenge_products (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            price INT NOT NULL
        )
        """,
        """
        CREATE TABLE challenge_customers (
            id INT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(200) NOT NULL,
            phone VARCHAR(40) NOT NULL,
            last_order_total INT NOT NULL
        )
        """,
        """
        CREATE TABLE challenge_orders (
            id INT PRIMARY KEY,
            item VARCHAR(100) NOT NULL,
            status VARCHAR(80) NOT NULL
        )
        """,
        """
        CREATE TABLE challenge_notes (
            id INT PRIMARY KEY AUTO_INCREMENT,
            text VARCHAR(300) NOT NULL
        )
        """,
        """
        CREATE TABLE challenge_profiles (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(160) NOT NULL
        )
        """,
        """
        CREATE TABLE challenge_logs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(100) NOT NULL,
            action VARCHAR(200) NOT NULL
        )
        """,
    ]
    try:
        with conn.cursor() as cur:
            for statement in statements:
                cur.execute(statement)
            cur.executemany(
                "INSERT INTO challenge_users (username, password, role) VALUES (%s, %s, %s)",
                [
                    ("admin", "Challenge-Admin-Pass-2026!", "admin"),
                    ("staff", "staffpw123", "staff"),
                    ("guest", "guestpw123", "guest"),
                ],
            )
            cur.executemany(
                "INSERT INTO challenge_products (name, price) VALUES (%s, %s)",
                [
                    ("ノートPC", 89800),
                    ("ワイヤレスマウス", 2980),
                    ("USB-Cハブ", 4980),
                    ("メカニカルキーボード", 12800),
                ],
            )
            cur.executemany(
                "INSERT INTO challenge_customers (email, phone, last_order_total) VALUES (%s, %s, %s)",
                [
                    ("sato.challenge@example.test", "090-1111-2222", 128000),
                    ("suzuki.challenge@example.test", "080-3333-4444", 54800),
                    ("takahashi.challenge@example.test", "070-5555-6666", 23900),
                ],
            )
            cur.executemany(
                "INSERT INTO challenge_orders (id, item, status) VALUES (%s, %s, %s)",
                [
                    (1001, "ノートPC", "発送済み"),
                    (1002, "ワイヤレスマウス", "準備中"),
                    (1003, "USB-Cハブ", "配達完了"),
                ],
            )
            cur.executemany(
                "INSERT INTO challenge_notes (text) VALUES (%s)",
                [("講義用の初期メモです",), ("この掲示板はローカル環境専用です",)],
            )
            cur.executemany(
                "INSERT INTO challenge_logs (username, action) VALUES (%s, %s)",
                [
                    ("admin", "顧客リストをCSV出力"),
                    ("admin", "管理者パスワードを変更"),
                    ("staff", "注文1002を更新"),
                    ("guest", "商品ページを閲覧"),
                ],
            )
        conn.commit()
    finally:
        conn.close()


def seed_mongo():
    db = mongo_db()
    db.challenge_users.delete_many({})
    db.challenge_customers.delete_many({})
    db.challenge_users.insert_many(
        [
            {"username": "admin", "password": "Mongo-Challenge-Pass-2026!", "role": "admin"},
            {"username": "apiuser", "password": "apiuserpw123", "role": "api"},
        ]
    )
    db.challenge_customers.insert_many(
        [
            {"name": "佐藤", "email": "sato.mongo@example.test", "total": 128000},
            {"name": "鈴木", "email": "suzuki.mongo@example.test", "total": 54800},
            {"name": "高橋", "email": "takahashi.mongo@example.test", "total": 23900},
        ]
    )


app = Flask(__name__)
seed_mysql()
seed_mongo()

LAYOUT = """
<!doctype html>
<meta charset="utf-8">
<title>Injection Challenge</title>
<style>
body { font-family: sans-serif; max-width: 980px; margin: 32px auto; line-height: 1.6; }
nav a { margin-right: 16px; }
input, textarea { padding: 6px; margin: 4px 0; }
table { border-collapse: collapse; margin-top: 16px; }
td, th { border: 1px solid #bbb; padding: 6px 10px; }
pre { background: #f6f8fa; padding: 12px; white-space: pre-wrap; }
.ok { color: #1a7f37; font-weight: bold; }
.ng { color: #cf222e; font-weight: bold; }
</style>
<nav>
  <a href="/">Top</a>
  <a href="/login">Login</a>
  <a href="/catalog">Catalog</a>
  <a href="/track">Order</a>
  <a href="/notes">Guestbook</a>
  <a href="/register">Register</a>
  <a href="/api/help">API</a>
</nav>
<hr>
{{ body|safe }}
"""


def page(body):
    return render_template_string(LAYOUT, body=body)


@app.route("/")
def index():
    return page(
        """
        <h1>Injection Challenge Shop</h1>
        <p>コードを読まずに、ZAP・ブラウザ・curlで脆弱ポイントを探す総合演習です。</p>
        <ul>
          <li>目標: 認証突破、情報漏洩、改ざん、ブラインド抽出、NoSQL injectionを見つける</li>
          <li>対象: このローカルアプリだけ（http://127.0.0.1:5007）</li>
          <li>ヒント: 入力欄、URLパラメータ、JSON API、保存された値の再利用に注目</li>
        </ul>
        """
    )


@app.route("/login", methods=["GET", "POST"])
def login():
    message = ""
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        query = (
            "SELECT id, username, role FROM challenge_users WHERE username = '"
            + username
            + "' AND password = '"
            + password
            + "' LIMIT 1"
        )
        conn = mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(query)
                user = cur.fetchone()
            if user:
                message = f"<p class='ok'>ログイン成功: {user[1]} ({user[2]}) / FLAG-LOGIN-BYPASS</p>"
            else:
                message = "<p class='ng'>ログイン失敗</p>"
        except pymysql.MySQLError as exc:
            message = f"<p class='ng'>エラー: {exc}</p>"
        finally:
            conn.close()
    return page(
        f"""
        <h2>Login</h2>
        <form method="post">
          <label>Username<br><input name="username" size="48"></label><br>
          <label>Password<br><input name="password" type="password" size="48"></label><br>
          <button type="submit">Login</button>
        </form>
        {message}
        """
    )


@app.route("/catalog")
def catalog():
    q = request.args.get("q", "")
    rows = None
    error = ""
    if q != "" or "q" in request.args:
        query = "SELECT id, name, price FROM challenge_products WHERE name LIKE '%" + q + "%'"
        conn = mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(query)
                rows = cur.fetchall()
        except pymysql.MySQLError as exc:
            error = f"<p class='ng'>検索エラー: {exc}</p>"
        finally:
            conn.close()

    table = ""
    if rows is not None:
        table = "<table><tr><th>ID</th><th>Name</th><th>Price</th></tr>"
        for row in rows:
            table += f"<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>"
        table += "</table>"

    return page(
        f"""
        <h2>Catalog</h2>
        <form method="get">
          <label>Keyword<br><input name="q" size="72" value="{q}"></label>
          <button type="submit">Search</button>
        </form>
        {error}
        {table}
        """
    )


@app.route("/track")
def track():
    order_id = request.args.get("order_id", "")
    result = ""
    elapsed = None
    if order_id:
        query = "SELECT item, status FROM challenge_orders WHERE id = " + order_id
        conn = mysql_conn()
        start = time.time()
        try:
            with conn.cursor() as cur:
                cur.execute(query)
                row = cur.fetchone()
            result = f"見つかりました: {row[0]} ({row[1]})" if row else "見つかりません"
        except pymysql.MySQLError:
            result = "照会に失敗しました"
        finally:
            elapsed = time.time() - start
            conn.close()
    elapsed_text = "" if elapsed is None else f"<p>応答時間: {elapsed:.2f} 秒</p>"
    return page(
        f"""
        <h2>Order Tracking</h2>
        <form method="get">
          <label>Order ID<br><input name="order_id" size="72" value="{order_id}"></label>
          <button type="submit">Track</button>
        </form>
        <p>{result}</p>
        {elapsed_text}
        """
    )


@app.route("/notes", methods=["GET", "POST"])
def notes():
    message = ""
    if request.method == "POST":
        text = request.form.get("text", "")
        query = "INSERT INTO challenge_notes (text) VALUES ('" + text + "')"
        conn = mysql_conn(multi=True)
        try:
            with conn.cursor() as cur:
                cur.execute(query)
            conn.commit()
            message = "<p class='ok'>保存しました</p>"
        except pymysql.MySQLError as exc:
            message = f"<p class='ng'>保存エラー: {exc}</p>"
        finally:
            conn.close()

    conn = mysql_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, text FROM challenge_notes ORDER BY id")
            rows = cur.fetchall()
    finally:
        conn.close()
    items = "".join(f"<li>#{row[0]} {row[1]}</li>" for row in rows)
    return page(
        f"""
        <h2>Guestbook</h2>
        <form method="post">
          <textarea name="text" rows="4" cols="72"></textarea><br>
          <button type="submit">Save</button>
        </form>
        {message}
        <ul>{items}</ul>
        """
    )


@app.route("/register", methods=["GET", "POST"])
def register():
    message = ""
    if request.method == "POST":
        username = request.form.get("username", "")
        conn = mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO challenge_profiles (username) VALUES (%s)", (username,))
                profile_id = cur.lastrowid
            conn.commit()
            message = (
                f"<p class='ok'>登録しました。"
                f"<a href='/admin/report?profile_id={profile_id}'>管理レポートを見る</a></p>"
            )
        finally:
            conn.close()
    return page(
        f"""
        <h2>Profile Register</h2>
        <form method="post">
          <label>Display name<br><input name="username" size="72"></label>
          <button type="submit">Register</button>
        </form>
        {message}
        """
    )


@app.route("/admin/report")
def admin_report():
    profile_id = request.args.get("profile_id", "")
    conn = mysql_conn()
    rows = []
    error = ""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT username FROM challenge_profiles WHERE id = %s", (profile_id,))
            profile = cur.fetchone()
            if profile:
                stored_username = profile[0]
                query = "SELECT username, action FROM challenge_logs WHERE username = '" + stored_username + "'"
                cur.execute(query)
                rows = cur.fetchall()
            else:
                error = "profileが見つかりません"
    except pymysql.MySQLError as exc:
        error = str(exc)
    finally:
        conn.close()
    table = "<table><tr><th>User</th><th>Action</th></tr>"
    for row in rows:
        table += f"<tr><td>{row[0]}</td><td>{row[1]}</td></tr>"
    table += "</table>"
    return page(f"<h2>Admin Report</h2><p>{error}</p>{table}")


@app.route("/api/help")
def api_help():
    return page(
        """
        <h2>JSON API</h2>
        <pre>curl -s -X POST http://127.0.0.1:5007/api/login \\
  -H 'Content-Type: application/json' \\
  -d '{"username":"admin","password":"wrong"}'</pre>
        <pre>curl -s 'http://127.0.0.1:5007/api/customers?filter={"name":"佐藤"}'</pre>
        """
    )


@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(force=True, silent=True) or {}
    db = mongo_db()
    user = db.challenge_users.find_one(data, {"_id": 0})
    if user:
        return jsonify({"ok": True, "message": "ログイン成功", "user": user, "flag": "FLAG-NOSQL-LOGIN"})
    return jsonify({"ok": False, "message": "ログイン失敗"}), 401


@app.route("/api/customers")
def api_customers():
    raw_filter = request.args.get("filter", "{}")
    try:
        query = json.loads(raw_filter)
    except json.JSONDecodeError as exc:
        return jsonify({"error": str(exc), "raw_filter": raw_filter}), 400
    db = mongo_db()
    rows = list(db.challenge_customers.find(query, {"_id": 0}))
    return jsonify({"query": query, "rows": rows})


if __name__ == "__main__":
    port = int(os.environ.get("APP_PORT", "5007"))
    app.run(host="0.0.0.0", debug=True, port=port, use_reloader=False)
