TF ?= terraform
APPLY = apply -input=false -auto-approve

.PHONY: help prime recursive pool mine explorer tamper destroy clean

help:
	@echo "make prime     [START=1 END=100]           # Phase 1: HCL だけで素数を探す"
	@echo "make recursive [START=1 END=2000 LEAF=500] # Phase 2: Terraform が Terraform を再帰起動"
	@echo "make pool      [MINERS=4 START=1 END=20000] # Phase 3: Terraform Miner を並列起動"
	@echo "make mine      [BLOCKS=1]                  # Phase 4: PrimeChain のブロックを掘る"
	@echo "make explorer                              # Phase 4: チェーンの中身を見る"
	@echo "make tamper    [BLOCK=0]                   # Phase 4: 台帳を改ざんする（要 jq）"
	@echo "make destroy                               # Phase 5: terraform destroy で全部壊す"
	@echo "make clean                                 # State や .terraform を全部消す"

# Phase 1: Prime Discovery
prime: START ?= 1
prime: END   ?= 100
prime:
	$(TF) -chdir=prime-discovery init -input=false >/dev/null
	$(TF) -chdir=prime-discovery $(APPLY) -var start=$(START) -var end=$(END)

# Phase 2: Recursive Terraform
recursive: START ?= 1
recursive: END   ?= 2000
recursive: LEAF  ?= 500
recursive:
	$(TF) -chdir=recursive init -input=false >/dev/null
	$(TF) -chdir=recursive $(APPLY) -var start=$(START) -var end=$(END) -var leaf_size=$(LEAF)
	$(TF) -chdir=recursive output tree

# Phase 3: Distributed Prime Mining
pool: MINERS ?= 4
pool: START  ?= 1
pool: END    ?= 20000
pool:
	$(TF) -chdir=pool init -input=false >/dev/null
	$(TF) -chdir=pool $(APPLY) -var miners=$(MINERS) -var start=$(START) -var end=$(END)
	$(TF) -chdir=pool output reports

# Phase 4: PrimeChain
# terraform apply 1 回 = ブロック 1 個
mine: BLOCKS ?= 1
mine:
	$(TF) -chdir=chain init -input=false >/dev/null
	@for i in $$(seq $(BLOCKS)); do \
		$(TF) -chdir=chain $(APPLY) -no-color > chain/apply.log 2>&1 || { sed -n '/^Error/,$$p' chain/apply.log; exit 1; }; \
		grep -E '🚀|✅' chain/apply.log | sed 's/.*(local-exec): //'; \
		$(TF) -chdir=chain output -raw mined; echo; \
	done

explorer:
	@$(TF) -chdir=chain output -raw explorer; echo

# 台帳のブロックの素数を 4 に書き換える。次の make mine は plan の時点で検証に落ちる
tamper: BLOCK ?= 0
tamper:
	jq '.[$(BLOCK)].prime = 4' chain/ledger.json > chain/ledger.tampered.json
	mv chain/ledger.tampered.json chain/ledger.json
	@echo "😈 Block #$(BLOCK) の prime を 4 に書き換えました"

# Phase 5: Terraform Destroy
# 親を destroy すると子 Terraform も連鎖して destroy される
destroy:
	@for d in chain pool recursive prime-discovery; do \
		if [ -d $$d/.terraform ]; then \
			echo "== terraform destroy: $$d"; \
			$(TF) -chdir=$$d destroy -input=false -auto-approve -no-color > $$d/destroy.log 2>&1 \
				|| { sed -n '/^Error/,$$p' $$d/destroy.log; exit 1; }; \
			grep -E '💥|Destroy complete' $$d/destroy.log | sed 's/.*(local-exec): //'; \
		fi; \
	done

clean:
	find . \( -name .terraform -o -name .runs \) -type d -prune -exec rm -rf {} +
	find . \( -name '*.tfstate' -o -name '*.tfstate.*' -o -name .terraform.lock.hcl -o -name '*.log' -o -name ledger.json \) -type f -delete
