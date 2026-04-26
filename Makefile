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

PORT ?= 3000
URL := http://localhost:$(PORT)

demo:
	@echo "Building demo (React bundle)..."
	npm run svg
	@echo "Demo built — serve react-icons/packages/_react-icons_all/ with demo.html"

dist: demo
	rm -rf dist
	mkdir -p dist
	cp demo.html dist/index.html
	cp react-icons/packages/_react-icons_all/demo-bundle.js dist/
	cp -r svg dist/

# Build the demo and open it in the default browser.
# Works on macOS (open) and Linux (xdg-open); falls back to printing the URL.
serve: dist
	@echo "Serving $(URL)"
	@( sleep 1; \
	   if command -v open >/dev/null 2>&1; then open "$(URL)"; \
	   elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$(URL)"; \
	   else echo "Open $(URL) in your browser"; fi ) &
	npx serve -l $(PORT) dist

.PHONY: demo dist serve
