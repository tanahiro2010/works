MARP := npx -p @marp-team/marp-cli@latest marp --allow-local-files --theme-set .marp/gdg.css --html

.PHONY: slide $(filter-out slide,$(MAKECMDGOALS))

# Usage: make slide '<content-name>'
# Builds the matching project under slides/speakerdeck or slides/slides.
slide:
	@name="$(strip $(filter-out slide,$(MAKECMDGOALS)))"; \
	if [ -z "$$name" ]; then \
		echo "Usage: make slide '<content-name>'" >&2; \
		exit 1; \
	fi; \
	project_dir="$$name"; \
	if [ ! -f "$$project_dir/slide.md" ] && [ -f "slides/speakerdeck/$$name/slide.md" ]; then \
		project_dir="slides/speakerdeck/$$name"; \
	fi; \
	if [ ! -f "$$project_dir/slide.md" ] && [ -f "slides/slides/$$name/slide.md" ]; then \
		project_dir="slides/slides/$$name"; \
	fi; \
	if [ ! -f "$$project_dir/slide.md" ]; then \
		echo "error: '$$name/slide.md' not found" >&2; \
		exit 1; \
	fi; \
	project_name="$$(basename "$$project_dir")"; \
	mkdir -p "$$project_dir/slide" "$$project_dir/outputs"; \
	$(MARP) "$$project_dir/slide.md" -o "$$project_dir/index.html" && \
	$(MARP) --pdf "$$project_dir/slide.md" -o "$$project_dir/outputs/$$project_name.pdf" && \
	echo "Built $$project_dir/index.html" && \
	echo "Built $$project_dir/outputs/$$project_name.pdf"

# Swallow the content-name so make doesn't treat it as an unknown target.
%:
	@:
