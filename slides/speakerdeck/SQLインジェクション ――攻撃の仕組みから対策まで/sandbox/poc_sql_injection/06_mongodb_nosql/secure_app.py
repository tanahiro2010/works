"""
PoC⑥: MongoDB NoSQL injection（修正版）

入力を文字列として検証し、MongoDB演算子を含むオブジェクトを認証クエリに渡さない。
"""
import os
import time

from flask import Flask, jsonify, render_template_string, request
from pymongo import MongoClient
from pymongo.errors import PyMongoError


MONGO_URI = os.environ.get("MONGO_URI", "mongodb://127.0.0.1:27017")
DB_NAME = "nosql_training"


def get_db():
    for _ in range(30):
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1000)
            client.admin.command("ping")
            return client[DB_NAME]
        except PyMongoError:
            time.sleep(1)
    raise RuntimeError("MongoDB is not ready")


def seed_db():
    db = get_db()
    if db.users.count_documents({}) == 0:
        db.users.insert_many(
            [
                {"username": "admin", "password": "Mongo-Admin-Pass-2026!", "role": "admin"},
                {"username": "alice", "password": "alicepw123", "role": "user"},
            ]
        )
    if db.customers.count_documents({}) == 0:
        db.customers.insert_many(
            [
                {"name": "佐藤", "email": "sato.customer@example.test", "total": 128000},
                {"name": "鈴木", "email": "suzuki.customer@example.test", "total": 54800},
                {"name": "高橋", "email": "takahashi.customer@example.test", "total": 23900},
            ]
        )


def is_plain_string(value):
    return isinstance(value, str) and 1 <= len(value) <= 100


app = Flask(__name__)
seed_db()

PAGE = """
<h2>MongoDBログイン/API（修正版 / PoC⑥）</h2>
<p>ログインではusername/passwordを文字列に限定し、条件オブジェクトを拒否します。</p>
<pre>curl -s -X POST http://127.0.0.1:5016/login \\
  -H 'Content-Type: application/json' \\
  -d '{"username":{"$ne":null},"password":{"$ne":null}}'</pre>
"""


@app.route("/")
def index():
    return render_template_string(PAGE)


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True, silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    if not is_plain_string(username) or not is_plain_string(password):
        return jsonify({"ok": False, "message": "username/passwordは文字列で指定してください"}), 400

    db = get_db()
    user = db.users.find_one(
        {"username": username, "password": password},
        {"_id": 0, "password": 0},
    )
    if user:
        return jsonify({"ok": True, "message": "ログイン成功", "user": user})
    return jsonify({"ok": False, "message": "ログイン失敗"}), 401


@app.route("/api/customers")
def customers():
    name = request.args.get("name", "")
    if len(name) > 50:
        return jsonify({"error": "nameが長すぎます"}), 400

    query = {}
    if name:
        query["name"] = name

    db = get_db()
    rows = list(db.customers.find(query, {"_id": 0}))
    return jsonify({"query": query, "rows": rows})


if __name__ == "__main__":
    port = int(os.environ.get("APP_PORT", "5016"))
    app.run(host="0.0.0.0", debug=True, port=port)
