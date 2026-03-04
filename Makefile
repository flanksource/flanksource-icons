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
	@echo "Building demo (React bundle)..."
	npm run svg
	@echo "Demo built — serve react-icons/packages/_react-icons_all/ with demo.html"
