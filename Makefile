build:
	rm -rf dist && npm run build

check-types:
	npx tsc --noEmit

lint:
	npx oxlint .

release:
	npm run release
