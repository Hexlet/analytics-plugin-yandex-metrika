build:
	rm -rf dist && npm run build

check-types:
	npx tsc --noEmit

release:
	npx release-it
