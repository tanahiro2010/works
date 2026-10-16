# ---------------------------------------------------------------
# Phase 3: Distributed Prime Mining - Pool
#
# 親 Terraform が探索範囲を Miner の数で割り、
# Miner（= 別プロセスの Terraform）を並列に起動する。
#
#   pool ──┬── miner-01 [start, ...)   ← それぞれ独立した State
#          ├── miner-02
#          ├── ...
#          └── miner-NN
# ---------------------------------------------------------------

terraform {
  required_version = ">= 1.5"
}

variable "miners" {
  description = "起動する Miner の数"
  type        = number
  default     = 4
}

variable "start" {
  type    = number
  default = 1
}

variable "end" {
  type    = number
  default = 20000
}

locals {
  span = ceil((var.end - var.start) / var.miners)

  # miner-01 → [start, start + span), miner-02 → ...
  assignments = {
    for i in range(var.miners) : format("miner-%02d", i + 1) => {
      start = var.start + i * local.span
      end   = min(var.start + (i + 1) * local.span, var.end)
    }
  }
}

module "miner" {
  source   = "../modules/spawn"
  for_each = local.assignments

  name       = each.key
  config_dir = abspath("${path.root}/../miner")
  runs_dir   = abspath("${path.root}/.runs")
  vars = {
    miner_id = each.key
    start    = tostring(each.value.start)
    end      = tostring(each.value.end)
  }
}

locals {
  # for_each のキーは辞書順（miner-01 → miner-NN）なので、連結すれば昇順のまま
  primes = flatten([for m in module.miner : m.outputs.primes])
}

output "reports" {
  value = [for m in module.miner : m.outputs.report]
}

output "summary" {
  value = format(
    "%d 台の Terraform Miner が [%d, %d) から %d 個の素数を発見しました（最大: %s）",
    var.miners,
    var.start,
    var.end,
    length(local.primes),
    try(tostring(max(local.primes...)), "なし"),
  )
}

output "primes" {
  value = local.primes
}
