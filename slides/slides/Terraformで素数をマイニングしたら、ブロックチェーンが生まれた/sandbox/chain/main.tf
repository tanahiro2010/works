# ---------------------------------------------------------------
# Phase 4: PrimeChain
#
# terraform apply 1 回 = ブロック 1 個の採掘。
#
#   1. 台帳（ledger.json）から、前回までのチェーンを読む
#   2. 次のブロックの探索範囲を Miner に割り振って並列に起動する
#   3. 各 Miner は「素数 p」と「nonce」の組で
#      sha256(height|prev_hash|miner|p|nonce) が 0 * difficulty で始まるものを探す
#   4. 採用ルール（ハッシュ値が最小の候補）でブロックを 1 つ選ぶ
#   5. チェーン全体を HCL で検証し、通ったら台帳に書き込む
#
# terraform destroy すると、ブロックも台帳も Miner も全部消える。
# ---------------------------------------------------------------

terraform {
  required_version = ">= 1.5"
}

variable "miners" {
  description = "Miner の数"
  type        = number
  default     = 4
}

variable "base" {
  description = "ブロック #0 の探索開始位置"
  type        = number
  default     = 2
}

variable "window" {
  description = "1 ブロックで探索する整数の幅"
  type        = number
  default     = 400
}

variable "difficulty" {
  description = "ブロックハッシュの先頭に必要な 0 の数"
  type        = number
  default     = 2
}

variable "max_nonce" {
  description = "素数 1 つあたりに試す nonce の数"
  type        = number
  default     = 64
}

# ---------------------------------------------------------------
# 1. 前回までのチェーン
#
# 台帳は ledger.json（中身は HCL が jsonencode したチェーン）。
#
# ※ 自分自身の terraform.tfstate を読む方式は NG。
#   apply 中に Terraform が State を書き換えるので、plan 時と apply 時で
#   読める値が変わってしまう。
# ---------------------------------------------------------------

locals {
  genesis_hash = join("", [for _ in range(64) : "0"])

  ledger = "${path.root}/ledger.json"

  # 台帳がない → ジェネシスから
  prev_chain = try(jsondecode(file(local.ledger)), [])
  height     = length(local.prev_chain)
  prev_hash  = try(local.prev_chain[local.height - 1].hash, local.genesis_hash)

  # ブロックごとに探索範囲を window ずつ進める
  #   #0 → [base, base + window), #1 → [base + window, base + 2 * window), ...
  lo   = var.base + local.height * var.window
  hi   = local.lo + var.window
  span = ceil(var.window / var.miners)

  assignments = {
    for i in range(var.miners) : format("miner-%02d", i + 1) => {
      start = local.lo + i * local.span
      end   = min(local.lo + (i + 1) * local.span, local.hi)
    }
  }
}

# ---------------------------------------------------------------
# 2. Miner を並列に起動する
# ---------------------------------------------------------------

module "miner" {
  source   = "../modules/spawn"
  for_each = local.assignments

  name       = each.key
  config_dir = abspath("${path.root}/../miner")
  runs_dir   = abspath("${path.root}/.runs")
  vars = {
    miner_id   = each.key
    start      = tostring(each.value.start)
    end        = tostring(each.value.end)
    height     = tostring(local.height)
    prev_hash  = local.prev_hash
    difficulty = tostring(var.difficulty)
    max_nonce  = tostring(var.max_nonce)
  }
}

# ---------------------------------------------------------------
# 3, 4. 候補を集めて、採用ルールでブロックを 1 つ選ぶ
# ---------------------------------------------------------------

locals {
  # 候補が見つからなかった Miner の candidate は null（= State に Output が残らない）
  candidates = [
    for m in module.miner : m.outputs.candidate
    if try(m.outputs.candidate, null) != null
  ]

  # 採用ルール: 条件を満たした候補のうち、ハッシュ値が辞書順で最小のもの
  winner = try([
    for c in local.candidates : c
    if c.hash == sort(local.candidates[*].hash)[0]
  ][0], null)

  new_block = local.winner == null ? null : {
    height     = local.height
    prev_hash  = local.prev_hash
    miner      = local.winner.miner
    prime      = local.winner.prime
    nonce      = local.winner.nonce
    difficulty = var.difficulty
    hash       = local.winner.hash
  }

  # 最後の要素が今回のブロック（plan 時点では未確定）
  chain = concat(local.prev_chain, [local.new_block])
}

# ---------------------------------------------------------------
# 5. チェーン全体の検証（HCL）
# ---------------------------------------------------------------

locals {
  # 過去のブロックは plan の時点で検証される（改ざんしたら plan で落ちる）
  verifications = [
    for i, b in local.chain : b == null ? null : {
      # ブロック番号が連番になっている
      height = b.height == i
      # 前ブロックのハッシュとつながっている
      link = b.prev_hash == try(local.chain[i - 1].hash, local.genesis_hash)
      # ブロックハッシュが中身から再計算した値と一致する
      hash = b.hash == sha256(format("%d|%s|%s|%d|%d", b.height, b.prev_hash, b.miner, b.prime, b.nonce))
      # ハッシュが難易度条件を満たす
      work = startswith(b.hash, join("", [for _ in range(b.difficulty) : "0"]))
      # prime が本当に素数
      prime = b.prime >= 2 && alltrue([
        for d in range(2, max(2, floor(pow(b.prime, 0.5)) + 1)) : b.prime % d != 0
      ])
    }
  ]
}

# ブロック 1 つ = リソース 1 つ。
# 検証に通らないブロックは precondition で弾かれ、チェーンに追加されない。
resource "terraform_data" "block" {
  for_each = { for i in range(local.height + 1) : format("%04d", i) => i }

  input = local.chain[each.value]

  lifecycle {
    precondition {
      condition     = local.chain[each.value] != null
      error_message = "ブロック #${each.value} を採掘できませんでした。difficulty を下げるか max_nonce を増やしてください。"
    }

    precondition {
      condition     = try(alltrue(values(local.verifications[each.value])), false)
      error_message = "ブロック #${each.value} の検証に失敗しました: ${jsonencode(try(local.verifications[each.value], {}))}"
    }
  }

  # Phase 5: Terraform で素数を構築し、Terraform で素数を破壊する
  provisioner "local-exec" {
    when  = destroy
    quiet = true
    environment = {
      HEIGHT = self.input.height
      PRIME  = self.input.prime
    }
    command = "echo \"💥 Block #$HEIGHT destroyed. prime $PRIME is gone.\""
  }
}

# 検証に通ったチェーンを台帳に書き込む。
# 書き込む中身は HCL が作った JSON。シェルはファイルに置くだけ。
resource "terraform_data" "ledger" {
  triggers_replace = local.chain
  input            = local.ledger

  provisioner "local-exec" {
    quiet = true
    environment = {
      LEDGER = self.input
      CHAIN  = jsonencode(local.chain)
    }
    command = "printf '%s' \"$CHAIN\" > \"$LEDGER\""
  }

  depends_on = [terraform_data.block]
}

# Phase 5: terraform destroy で台帳ごと消す（= チェーンはジェネシスに戻る）。
# ledger は毎ブロック replace されるので、そちらに destroy 時の処理を書くと
# 掘るたびに台帳が消えてしまう。なので消す係は別のリソースにする。
resource "terraform_data" "ledger_file" {
  input = local.ledger

  provisioner "local-exec" {
    when        = destroy
    quiet       = true
    environment = { LEDGER = self.input }
    command     = "rm -f \"$LEDGER\" && echo \"💥 ledger.json destroyed. PrimeChain is gone.\""
  }
}

# ---------------------------------------------------------------
# Output
# ---------------------------------------------------------------

output "chain" {
  value      = local.chain
  depends_on = [terraform_data.ledger]
}

output "mined" {
  value = format(
    "⛏  Block #%d mined by %s: prime=%d nonce=%d hash=%s (%d candidates, %d hashes)",
    local.new_block.height,
    local.new_block.miner,
    local.new_block.prime,
    local.new_block.nonce,
    local.new_block.hash,
    length(local.candidates),
    sum([for m in module.miner : m.outputs.hashes]),
  )
  depends_on = [terraform_data.ledger]
}

output "explorer" {
  description = "チェーンの中身"
  value = join("\n", [
    for b in local.chain : format(
      "#%-3d %s ← %s  %-8s prime=%-6d nonce=%d",
      b.height,
      substr(b.hash, 0, 16),
      substr(b.prev_hash, 0, 16),
      b.miner,
      b.prime,
      b.nonce,
    )
  ])
  depends_on = [terraform_data.ledger]
}
