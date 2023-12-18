VERSION = 0.1.1

.PHONY: all
all: html python

.PHONY: html
html: html/degenprime.wasm html/index.html html/degenprime.js html/degenprime.js.map

browser/node_modules browser/package-lock.json: browser/package.json
	cd browser && npm install

browser/dist/degenprime.js browser/dist/degenprime.js.map: browser/node_modules browser/package-lock.json browser/webpack.config.js browser/src/degenprime.js
	cd browser && npm run build

html/:
	mkdir -m 0755 html

html/degenprime.wasm: degenprime/build/degenprime.wasm html/
	install -m 0644 $< $@

html/%: browser/dist/% html/
	install -m 0644 $< $@

html/%: browser/% html/
	install -m 0644 $< $@

.PHONY: python
python: python/dist/degenprime-$(VERSION).tar.gz

python/src/degenprime/libexec/:
	mkdir -m 0755 $@

python/src/degenprime/libexec/degenprime.wasm: degenprime/build/degenprime.wasm python/src/degenprime/libexec/
	install -m 0644 $< $@

python/dist/degenprime-%.tar.gz: python/src/degenprime/libexec/degenprime.wasm
	cd python && python3 -m build

.PHONY: clean
clean:
	rm -rf python/dist browser/dist browser/node_modules
	rm -rf python/src/degenprime.egg-info
	rm -rf python/src/degenprime/libexec
	rm -rf html
