# ---------------------------------------------------------------
# Phase 2: Recursive Terraform
#
# HCL には再帰関数がない。なら Terraform を再帰起動すればいい。
#
#   - 探索範囲が leaf_size 以下 → 自分で素数を探す
#   - それより大きい           → 範囲を半分に割り、
#                                 「自分自身（このディレクトリ）」を子 Terraform として 2 つ起動する
# ---------------------------------------------------------------

terraform {
  required_version = ">= 1.5"

  # 直接 apply したときの State の置き場所。
  # 子プロセスは -backend-config で自分専用の場所に上書きする。
  # （ここを ./terraform.tfstate にすると子の init が親の State に触ってしまう）
  backend "local" {
    path = ".runs/root/terraform.tfstate"
  }
}

variable "start" {
  type    = number
  default = 1
}

variable "end" {
  type    = number
  default = 2000
}

variable "leaf_size" {
  description = "これ以下の範囲なら再帰せずに自分で計算する"
  type        = number
  default     = 500
}

variable "node_id" {
  description = "再帰木の中での自分の位置（root, root.L, root.L.R, ...）"
  type        = string
  default     = "root"
}

variable "runs_dir" {
  description = "子プロセスの State 置き場。空ならこのディレクトリの .runs"
  type        = string
  default     = ""
}

locals {
  runs_dir = var.runs_dir != "" ? var.runs_dir : abspath("${path.root}/.runs")
  is_leaf  = var.end - var.start <= var.leaf_size
  mid      = floor((var.start + var.end) / 2)
  depth    = length(split(".", var.node_id)) - 1

  children = local.is_leaf ? {} : {
    L = { start = var.start, end = local.mid }
    R = { start = local.mid, end = var.end }
  }
}

# 葉: 自分で素数を探す
module "prime" {
  source = "../modules/prime"
  count  = local.is_leaf ? 1 : 0

  start = var.start
  end   = var.end
}

# 枝: 自分自身を子 Terraform として起動する
module "child" {
  source   = "../modules/spawn"
  for_each = local.children

  name       = "${var.node_id}.${each.key}"
  config_dir = abspath(path.root)
  runs_dir   = local.runs_dir
  vars = {
    start     = tostring(each.value.start)
    end       = tostring(each.value.end)
    leaf_size = tostring(var.leaf_size)
    node_id   = "${var.node_id}.${each.key}"
    runs_dir  = local.runs_dir
  }
}

locals {
  # for_each のキーは辞書順（L → R）なので、連結すれば昇順のまま
  primes = concat(
    flatten(module.prime[*].primes),
    flatten([for c in module.child : c.outputs.primes]),
  )
}

output "primes" {
  value = local.primes
}

output "processes" {
  description = "この部分木で起動された Terraform プロセスの数（自分を含む）"
  value       = 1 + sum(concat([0], [for c in module.child : c.outputs.processes]))
}

output "tree" {
  description = "再帰木"
  value = concat(
    [format(
      "%s%s [%d, %d) %s",
      join("", [for _ in range(local.depth) : "    "]),
      var.node_id,
      var.start,
      var.end,
      local.is_leaf ? "→ ${length(local.primes)} primes" : "→ split",
    )],
    flatten([for c in module.child : c.outputs.tree]),
  )
}
