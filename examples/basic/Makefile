build:
	extism-js dist/index.js -i test.d.ts -o test.wasm
	$$WASI_SDK_BIN/clang -o user.wasm user.c --target=wasm32-wasi -Wl,--export=example -mexec-model=reactor -Wl,--import-undefined
	$$WASI_SDK_BIN/clang -o host.wasm host.c --target=wasm32-wasi -Wl,--export=some_function -mexec-model=reactor -Wl,--import-undefined

