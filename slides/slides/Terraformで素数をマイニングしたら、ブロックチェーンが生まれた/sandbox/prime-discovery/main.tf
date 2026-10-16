# ---------------------------------------------------------------
# Phase 1: Prime Discovery
#
#   terraform apply -var start=1 -var end=100
#
# リソースは 1 つも作らない。terraform apply は「素数を計算する」だけ。
# ---------------------------------------------------------------

terraform {
  required_version = ">= 1.5"
}

variable "start" {
  type    = number
  default = 1
}

variable "end" {
  type    = number
  default = 100
}

module "prime" {
  source = "../modules/prime"

  start = var.start
  end   = var.end
}

output "primes" {
  value = module.prime.primes
}

output "summary" {
  value = format(
    "[%d, %d) の %d 個の整数を判定し、%d 個の素数を発見しました（最大: %s）",
    var.start,
    var.end,
    module.prime.checked,
    length(module.prime.primes),
    try(tostring(max(module.prime.primes...)), "なし"),
  )
}
