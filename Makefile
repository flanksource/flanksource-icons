.PHONY: %.svg

.PHONY: force

%.svg: force
	mkdir -p svg/output
	rsvg-convert $@  -h 32 -a -f svg -o svg/output/$(shell basename $@)
	svgo -i svg/output/$(shell basename $@) -o svg --config svgo.config.mjs
	mv  svg/output/$(shell basename $@)  svg/$(shell basename $@)

force:

demo:
	sh make.sh
	cd react-icons/packages/demo && npm install && npm run build
