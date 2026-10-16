# ---------------------------------------------------------------
# Phase 1: Prime Discovery
#
# [start, end) の範囲から素数を探す。
# 計算はすべて HCL の式評価だけで行う（試し割り法）。
# ---------------------------------------------------------------

variable "start" {
  description = "探索開始（この値を含む）"
  type        = number
}

variable "end" {
  description = "探索終了（この値を含まない）"
  type        = number

  validation {
    # 試し割りの除数 range(2, √n + 1) も 1024 要素以内に収める必要がある
    condition     = var.end <= 1048576
    error_message = "end は 1048576 (= 1024^2) 以下にしてください。range() は 1024 要素までしか作れません。"
  }
}

locals {
  # range() は 1 回で最大 1024 要素までしか生成できない。
  # なので探索範囲を 1024 ずつのチャンクに分割してから flatten する。
  chunk_size = 1024
  lower      = max(var.start, 2)

  chunk_starts = var.end > local.lower ? range(local.lower, var.end, local.chunk_size) : []
  candidates = flatten([
    for s in local.chunk_starts : range(s, min(s + local.chunk_size, var.end))
  ])

  # n が素数 ⇔ 2..floor(√n) のどれでも割り切れない
  primes = [
    for n in local.candidates : n
    if alltrue([for d in range(2, floor(pow(n, 0.5)) + 1) : n % d != 0])
  ]
}

output "primes" {
  description = "見つかった素数（昇順）"
  value       = local.primes
}

output "checked" {
  description = "判定した整数の個数"
  value       = length(local.candidates)
}
