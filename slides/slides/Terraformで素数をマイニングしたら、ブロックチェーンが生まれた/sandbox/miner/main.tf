# ---------------------------------------------------------------
# Phase 3: Distributed Prime Mining - Miner
#
# 1 プロセス = 1 Miner。
# 親（pool / chain）から割り当てられた範囲の素数を探す。
# State は Miner ごとに独立しているので、ロック競合は起きない。
#
# Phase 4: PrimeChain
# max_nonce > 0 のときは、見つけた素数でブロックの候補も掘る。
# ---------------------------------------------------------------

terraform {
  required_version = ">= 1.5"

  # 直接 apply したときの State の置き場所。
  # pool から起動されるときは -backend-config で Miner 専用の場所に上書きされる。
  backend "local" {
    path = ".runs/solo/terraform.tfstate"
  }
}

variable "miner_id" {
  type    = string
  default = "solo-miner"
}

variable "start" {
  type    = number
  default = 1
}

variable "end" {
  type    = number
  default = 1000
}

variable "height" {
  description = "掘るブロックの番号"
  type        = number
  default     = 0
}

variable "prev_hash" {
  description = "前ブロックのハッシュ"
  type        = string
  default     = ""
}

variable "difficulty" {
  description = "ブロックハッシュの先頭に必要な 0 の数"
  type        = number
  default     = 0
}

variable "max_nonce" {
  description = "素数 1 つあたりに試す nonce の数（0 ならブロックは掘らない）"
  type        = number
  default     = 0
}

module "prime" {
  source = "../modules/prime"

  start = var.start
  end   = var.end
}

# ---------------------------------------------------------------
# Phase 4: ブロック候補の採掘
#
# 見つけた素数 p と nonce の全組み合わせについて
#   sha256("height|prev_hash|miner|p|nonce")
# を計算し、先頭が 0 * difficulty になるものを探す。
# ---------------------------------------------------------------

locals {
  target = join("", [for _ in range(var.difficulty) : "0"])

  attempts = flatten([
    for p in module.prime.primes : [
      for n in range(var.max_nonce) : {
        prime = p
        nonce = n
        hash  = sha256(format("%d|%s|%s|%d|%d", var.height, var.prev_hash, var.miner_id, p, n))
      }
    ]
  ])

  hits = [for a in local.attempts : a if startswith(a.hash, local.target)]

  # 自分の候補の中ではハッシュ値が最小のものを出す
  best = try([for a in local.hits : a if a.hash == sort(local.hits[*].hash)[0]][0], null)
}

output "miner_id" {
  value = var.miner_id
}

output "primes" {
  value = module.prime.primes
}

output "report" {
  value = format("%s: [%d, %d) → %d primes", var.miner_id, var.start, var.end, length(module.prime.primes))
}

output "hashes" {
  description = "計算した sha256 の回数"
  value       = length(local.attempts)
}

output "candidate" {
  description = "ブロックの候補（見つからなければ null）"
  value = local.best == null ? null : {
    height     = var.height
    prev_hash  = var.prev_hash
    miner      = var.miner_id
    prime      = local.best.prime
    nonce      = local.best.nonce
    difficulty = var.difficulty
    hash       = local.best.hash
  }
}
