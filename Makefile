build:
	rm -rf dist && npm run build

lint:
	npx eslint . && npm run lint
