# Terraform PrimeChain

> Infrastructure as Code。つまり Code。なら素数のマイニングもできますよね？

Terraform（HCL）だけで素数をマイニングし、ブロックチェーンを作るネタプロジェクトです。

- 計算ロジック（素数判定・マイニング条件・ハッシュ・ブロック検証）はすべて HCL
- シェルは Terraform の起動とファイル配置にしか使わない
- Provider は Terraform 組み込みのもの（`terraform_data` / `terraform_remote_state`）だけ

**Terraform 以外に計算させたら負け。**

## 必要なもの

- Terraform >= 1.5（動作確認: v1.16.6）
- make
- jq（`make tamper` を使うときだけ）

## Phase ごとのブランチ

各 Phase の完成形をブランチで用意しています。`git switch` すればその Phase の状態になります。

| ブランチ                      | 内容                                         |
| ----------------------------- | -------------------------------------------- |
| `phase-1-prime-discovery`     | HCL だけで素数を探す                         |
| `phase-2-recursive-terraform` | Terraform から Terraform を再帰起動する      |
| `phase-3-distributed-mining`  | 複数の Terraform Miner を並列で動かす        |
| `phase-4-primechain`          | 素数でブロックを掘ってブロックチェーンにする |
| `phase-5-terraform-destroy`   | `terraform destroy` で全部壊す（= `main`）   |

```sh
git switch phase-3-distributed-mining   # Phase 3 の完成形に飛ぶ
make clean                              # ブランチを切り替えたら一度掃除しておくと安全
```

## ディレクトリ構成

```
modules/prime/    Phase 1  HCL だけの素数判定
prime-discovery/  Phase 1  素数を Output するだけのルートモジュール
modules/spawn/    Phase 2  Terraform から Terraform を起動する（Phase 5 で destroy も連鎖）
recursive/        Phase 2  自分自身を再帰起動して範囲を分割統治
miner/            Phase 3  1 プロセス = 1 Miner（Phase 4 でブロック候補も掘る）
pool/             Phase 3  Miner を並列に起動する親
chain/            Phase 4  PrimeChain 本体
```

## Phase 1: Prime Discovery

```sh
make prime                    # [1, 100) の素数
make prime START=1 END=100000 # [1, 100000) の素数（手元で約 2 分）
```

- [modules/prime/main.tf](modules/prime/main.tf): `for` 式、`range()`、`%` で試し割り法を実装
- [prime-discovery/main.tf](prime-discovery/main.tf): 結果を Output として出すだけのルートモジュール

`range()` は 1 回に 1024 要素までしか生成できないので、探索範囲を 1024 ずつのチャンクに分割しています。

## Phase 2: Recursive Terraform

```sh
make recursive                          # [1, 2000) を 500 ずつに割るまで再帰
make recursive END=8000 LEAF=1000       # 15 プロセスの再帰木
```

HCL には再帰関数がありません。なので **Terraform が自分自身を Terraform として起動** します。

- [recursive/main.tf](recursive/main.tf): 範囲が `leaf_size` より大きければ半分に割って、自分自身を子 Terraform として 2 つ起動
- [modules/spawn/main.tf](modules/spawn/main.tf): 子 Terraform の起動役
  - `terraform_data` + `local-exec` で `terraform init && terraform apply` を叩く
  - 変数は `TF_VAR_*` 環境変数で渡す
  - 子ごとに `TF_DATA_DIR` と State（`-backend-config=path=...`）を分けるので、同じディレクトリを同時にいくつでも apply できる
  - 子の結果は `terraform_remote_state` で子の State から読み戻す

```
root [1, 8000) → split
    root.L [1, 4000) → split
        root.L.L [1, 2000) → split
            root.L.L.L [1, 1000) → 168 primes
            ...
```

State は `recursive/.runs/<node_id>/terraform.tfstate` に 1 プロセス 1 つずつできます。

> **ハマりどころ**: 設定ディレクトリ直下に `terraform.tfstate` があると、子の `terraform init` がそれを「移行すべき旧 State」とみなして親のロックとぶつかります。
> なので直接 apply したときの State も `backend "local" { path = ".runs/root/terraform.tfstate" }` に逃がしています。

## Phase 3: Distributed Prime Mining

```sh
make pool                           # 4 台の Miner で [1, 20000)
make pool MINERS=8 END=100000       # 8 台の Miner で [1, 100000)
```

Phase 1 の 1 プロセスで [1, 100000) を探すと約 2 分かかりますが、8 台の Miner なら約 40 秒です（M シリーズ Mac で計測）。

- [pool/main.tf](pool/main.tf): 親。探索範囲を Miner の数で割り、`for_each` で Miner を並列に起動する
- [miner/main.tf](miner/main.tf): 1 プロセス = 1 Miner。割り当てられた範囲の素数を探す

Terraform はデフォルトで 10 個までのリソースを並列に処理するので、Miner も勝手に並列で動きます。
各 Miner は `pool/.runs/miner-XX/terraform.tfstate` に自分専用の State を持つので、State のロック競合は起きません。

```
miner-01: [1, 5001) → 669 primes
miner-02: [5001, 10001) → 560 primes
miner-03: [10001, 15001) → 525 primes
miner-04: [15001, 20000) → 508 primes
```

## Phase 4: PrimeChain

```sh
make mine              # ブロックを 1 個掘る
make mine BLOCKS=5     # 5 個掘る
make explorer          # チェーンを見る
make tamper BLOCK=1    # 台帳のブロック #1 の素数を 4 に改ざんする → 次の make mine が plan で落ちる
make clean             # 台帳ごと全部消す
```

**`terraform apply` 1 回 = ブロック 1 個の採掘** です。

1. 台帳（`chain/ledger.json`）から前回までのチェーンを読む
2. 次のブロックの探索範囲（ブロックごとに `window` ずつ進む）を Miner に割り振って並列に起動
3. 各 Miner は見つけた素数 `p` と `nonce` の全組み合わせで `sha256("height|prev_hash|miner|p|nonce")` を計算し、先頭が `0` × `difficulty` になるものを探す
4. 採用ルール: 条件を満たした候補のうち、ハッシュ値が最小のものを採用
5. チェーン全体を HCL で検証し、通ったら台帳に書き込む

```
⛏  Block #7 mined by miner-01: prime=2837 nonce=9 hash=00040e90b46f2c29... (4 candidates, 2816 hashes)

#0   001817dc39715b1f ← 0000000000000000  miner-01 prime=101    nonce=23
#1   0008d290675e22b3 ← 001817dc39715b1f  miner-02 prime=593    nonce=19
#2   001d824ab4d1be8c ← 0008d290675e22b3  miner-04 prime=1103   nonce=48
...
```

ブロックの中身:

| フィールド   | 内容                                               |
| ------------ | -------------------------------------------------- |
| `height`     | ブロック番号                                       |
| `prev_hash`  | 前ブロックのハッシュ（#0 は `0` × 64）             |
| `miner`      | 採掘した Miner                                     |
| `prime`      | 発見した素数                                       |
| `nonce`      | Nonce                                              |
| `difficulty` | 難易度                                             |
| `hash`       | `sha256("height\|prev_hash\|miner\|prime\|nonce")` |

### 検証

[chain/main.tf](chain/main.tf) の `terraform_data.block` は 1 ブロック = 1 リソースで、`precondition` で次の 5 つを検証します。

- `height`: ブロック番号が連番
- `link`: `prev_hash` が前ブロックの `hash` と一致
- `hash`: `hash` が中身から再計算した値と一致
- `work`: `hash` が難易度条件を満たす
- `prime`: `prime` が本当に素数

過去のブロックは plan の時点で検証されるので、台帳を改ざんすると Miner を起動する前に落ちます。

```
Error: Resource precondition failed
ブロック #1 の検証に失敗しました:
{"hash":false,"height":true,"link":true,"prime":false,"work":true}
```

### 台帳の置き場所

最初は「自分自身の `terraform.tfstate` の Output を `jsondecode(file())` で読む」方式にしましたが、apply 中に Terraform が State を書き換えるので、plan 時と apply 時で値が変わって Terraform が panic しました。
なので検証済みのチェーンを `jsonencode` した JSON を、`terraform_data` + `local-exec` で `ledger.json` に置いています（シェルはファイルを置くだけ）。

## Phase 5: Terraform Destroy

```sh
make destroy
```

最後に Terraform 本来の機能、`terraform destroy` を実行します。

- [modules/spawn/main.tf](modules/spawn/main.tf): `when = destroy` の provisioner で、子 Terraform も `terraform destroy` してから State ごと消す。子が孫を持っていれば連鎖する
- [chain/main.tf](chain/main.tf): ブロックを destroy すると素数が消え、台帳（`ledger.json`）も消える。次の `make mine` はジェネシスから

```
== terraform destroy: chain
💥 ledger.json destroyed. PrimeChain is gone.
💥 Block #0 destroyed. prime 101 is gone.
💥 Block #2 destroyed. prime 1103 is gone.
💥 Block #1 destroyed. prime 593 is gone.
💥 23:39:16 destroyed:       miner-02
...
== terraform destroy: recursive
💥 23:39:19 destroyed:       root.R.L.L
💥 23:39:19 destroyed:       root.R.L.R
💥 23:39:19 destroyed:       root.R.L
...
💥 23:39:19 destroyed:       root.L
Destroy complete! Resources: 2 destroyed.
== terraform destroy: prime-discovery
Destroy complete! Resources: 0 destroyed.
```

recursive は親から見るとリソース 2 個ですが、その裏で 14 個の Terraform プロセスが連鎖して destroy されています。
そして Phase 1 の素数は、そもそもリソースではなかったので **0 destroyed** です。

**Terraform で素数を構築し、Terraform で素数を破壊する。**

## LT デモの流れ（例）

```sh
make clean
make prime END=100             # Phase 1: terraform apply で素数が出る
make recursive END=8000 LEAF=1000  # Phase 2: 15 プロセスの再帰木
make pool MINERS=8 END=100000  # Phase 3: 8 台並列（約 40 秒）
make mine BLOCKS=5             # Phase 4: ブロックを掘る
make explorer
make tamper BLOCK=1 && make mine   # 改ざん → plan で検知されて落ちる
make destroy                   # Phase 5: 全部壊す
```

_All You Need Is Terraform._
