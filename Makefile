all:
	make $(shell git status -s | awk '{if ($1 == "M" || $1 == "A") print $2}' | grep svg)


.PHONY: %.svg

.PHONY: force

%.svg: force
	mkdir -p svg/output
	rsvg-convert $@  -h 32 -a -f svg -o svg/output/$(shell basename $@)
	svgo -i svg/output/$(shell basename $@) -o svg --config svgo.config.mjs
	mv  svg/output/$(shell basename $@)  svg/$(shell basename $@)

force:

demo:
	@echo "Generating icon list..."
	@ls svg/*.svg | sed 's|svg/||g' | sed 's|\.svg||g' | python3 -c "import sys, json; print('const icons = ' + json.dumps([line.strip() for line in sys.stdin]) + ';')" > icons-list.js
	@echo "Icons list generated with $$(ls svg/*.svg | wc -l) icons"
