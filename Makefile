build-npm:
	deno run -A scripts/build-npm.ts $(tag)

publish-npm: 
	cd npm && npm publish