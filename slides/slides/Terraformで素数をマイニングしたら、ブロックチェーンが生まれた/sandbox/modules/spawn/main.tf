# ---------------------------------------------------------------
# Phase 2: Recursive Terraform
#
# Terraform から別の Terraform プロセスを起動する。
#
# 子プロセスは config_dir のルートモジュールを、run_dir に置いた
# 自分専用の State（と .terraform）で apply する。
#
# 注意: config_dir 直下に terraform.tfstate があると、子の init が
# 「旧 State の移行」をしようとして親のロックとぶつかる。
# なので起動される側のルートモジュールは backend "local" の path で
# State を config_dir 直下以外に置くこと。
# 子の Output は terraform_remote_state で親に読み戻す。
#
# シェルがやるのは「ディレクトリを掘る」「terraform を起動する」だけ。
#
# Phase 5: このリソースが destroy されると、子プロセスも terraform destroy する。
# 子がさらに子を持っていれば、それも連鎖して destroy される。
# ---------------------------------------------------------------

variable "name" {
  description = "子プロセスの識別子（run_dir 名にもなる）"
  type        = string
}

variable "config_dir" {
  description = "子プロセスで apply するルートモジュールの絶対パス"
  type        = string
}

variable "runs_dir" {
  description = "子プロセスの State を置くディレクトリの絶対パス"
  type        = string
}

variable "vars" {
  description = "子プロセスに渡す変数（TF_VAR_* として渡す）"
  type        = map(string)
}

locals {
  run_dir = "${var.runs_dir}/${var.name}"

  env = merge(
    { for k, v in var.vars : "TF_VAR_${k}" => v },
    {
      # 子ごとに .terraform を分けることで、同じ config_dir を同時に何個でも apply できる
      TF_DATA_DIR      = "${local.run_dir}/.terraform"
      TF_IN_AUTOMATION = "1"
      CONFIG_DIR       = var.config_dir
      RUN_DIR          = local.run_dir
      RUN_NAME         = var.name
    },
  )
}

resource "terraform_data" "process" {
  # 渡す変数が変わったら子プロセスを起動し直す
  triggers_replace = var.vars

  input = {
    env = local.env
  }

  provisioner "local-exec" {
    quiet       = true
    environment = self.input.env
    command     = <<-EOT
      set -e
      mkdir -p "$RUN_DIR"
      echo "🚀 $(date +%T) spawn terraform: $RUN_NAME"
      # 起動し直すたびにまっさらな TF_DATA_DIR で init する
      rm -rf "$TF_DATA_DIR"
      terraform -chdir="$CONFIG_DIR" init -input=false -no-color \
        -backend-config="path=$RUN_DIR/terraform.tfstate" > "$RUN_DIR/init.log" 2>&1 \
        || { tail -n 30 "$RUN_DIR/init.log"; exit 1; }
      terraform -chdir="$CONFIG_DIR" apply -input=false -auto-approve -no-color > "$RUN_DIR/apply.log" 2>&1 \
        || { tail -n 30 "$RUN_DIR/apply.log"; exit 1; }
      echo "✅ $(date +%T) done:            $RUN_NAME"
    EOT
  }

  # Phase 5: Terraform Destroy
  # 親が destroy されたら、子も terraform destroy してから State ごと消す
  provisioner "local-exec" {
    when        = destroy
    quiet       = true
    environment = self.input.env
    command     = <<-EOT
      set -e
      if [ -d "$TF_DATA_DIR" ]; then
        terraform -chdir="$CONFIG_DIR" destroy -input=false -auto-approve -no-color > "$RUN_DIR/destroy.log" 2>&1 \
          || { tail -n 30 "$RUN_DIR/destroy.log"; exit 1; }
        # 孫以下の destroy ログを親にも見せる
        grep '💥' "$RUN_DIR/destroy.log" | sed 's/.*(local-exec): //' || true
      fi
      rm -rf "$RUN_DIR"
      echo "💥 $(date +%T) destroyed:       $RUN_NAME"
    EOT
  }
}

# 子プロセスの State から Output を読む。
# depends_on があるので、子の apply が終わってから読まれる。
data "terraform_remote_state" "process" {
  backend = "local"
  config = {
    path = "${local.run_dir}/terraform.tfstate"
  }

  depends_on = [terraform_data.process]
}

output "outputs" {
  description = "子プロセスの Output"
  value       = data.terraform_remote_state.process.outputs
}
