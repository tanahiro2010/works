MARP := npx -p @marp-team/marp-cli@latest marp --allow-local-files --theme-set .marp/gdg.css --html

.PHONY: slide $(filter-out slide,$(MAKECMDGOALS))

# Usage: make slide <content-name>
# Builds <content-name>/slide/index.html and <content-name>/outputs/<content-name>.pdf
slide:
	@name="$(strip $(filter-out slide,$(MAKECMDGOALS)))"; \
	if [ -z "$$name" ]; then \
		echo "Usage: make slide <content-name>" >&2; \
		exit 1; \
	fi; \
	if [ ! -f "$$name/slide.md" ]; then \
		echo "error: '$$name/slide.md' not found" >&2; \
		exit 1; \
	fi; \
	mkdir -p "$$name/slide" "$$name/outputs"; \
	$(MARP) "$$name/slide.md" -o "$$name/slide/index.html" && \
	$(MARP) --pdf "$$name/slide.md" -o "$$name/outputs/$$name.pdf" && \
	echo "Built $$name/slide/index.html" && \
	echo "Built $$name/outputs/$$name.pdf"

# Swallow the content-name so make doesn't treat it as an unknown target.
%:
	@:
