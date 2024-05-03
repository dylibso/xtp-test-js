# xtp-test

A JavaScript test framework for [xtp](https://getxtp.com) /
[Extism](https://extism.org) plugins.

## Example

```javascript
// test.js
import { Test } from "@dylibso/xtp-test";

export function test() {
  // call a function from some Extism plugin (you'll link these up in the CLI command to run the test),
  // passing in some data and getting back a string (`callString` is a helper for string output)
  const res = Test.callString("count_vowels", "some input");
  const count = JSON.parse(res)["count"];
  // assert the count of the vowels is correct, giving the test case a name (which will be shown in the CLI output)
  Test.assertEqual("count_vowels of 'some input'", count, 4);

  // create a group of tests, which will be run together. This resets the plugin before and after the group is complete.
  Test.group("count_vowels maintains state", () => {
    let accumTotal = 0;
    const expectedFinalTotal = 12;
    for (let i = 0; i < 3; i++) {
      const res = Test.callString("count_vowels", "this is a test");
      const output = JSON.parse(res);
      accumTotal += output.count;
      Test.assertEqual(
        `total count increased to: ${accumTotal}`,
        accumTotal,
        4 * (i + 1),
      );
    }

    Test.assertEqual(
      "expected total reached by end of test",
      accumTotal,
      expectedFinalTotal,
    );
  });

  // this function is also an Extism plugin, so return an int32 value (non-zero returns will cause the whole test suite to fail.)
  return 0;
}
```

## API Docs

`Input` is a type to represent various kinds of function call input data.

```ts
type Input = string | ArrayBuffer | object;
```

`MemoryHandle` is a low-level interface to Extism memory. Most times you'll use
a helper function to work at a higher level.

```ts
interface MemoryHandle {
  offset: number;
  length: number;
  free(): void;
  readBuffer(): ArrayBuffer;
  readString(): string;
}
```

`Test` is the primary entrypoint to this library. It exposes plugin calling
functions and timing & assetion functions to validate expectations of plugin
behavior.

```ts
export class Test {
  // call a function from the Extism plugin being tested, passing in `Input` and returning the output as a raw `MemoryHandle`.
  static call(funcName: string, input: Input): MemoryHandle { ... }

  // call a function from the Extism plugin being tested, passing in `Input` and returning the output as a `string`.
  static callString(funcName: string, input: Input): string { ... }

  // call a function from the Extism plugin being tested, passing in `Input` and returning the output as a `ArrayBuffer`.
  static callBuffer(funcName: string, input: Input): ArrayBuffer { ... }

  // Run a test group, resetting the plugin before and after the group is run.
  static group(name: string, callback: () => void) { .. }

  // Reset the loaded plugin, clearing all state.
  static reset() { ... }

  // call a function from the Extism plugin being tested, passing in `Input` and get the number of nanoseconds spent in the function.
  static timeNanoseconds(funcName: string, input: Input): number { ... }

  // call a function from the Extism plugin being tested, passing in `Input` and get the number of seconds spent in the function.
  static timeSeconds(funcName: string, input: Input): number { ... }

  // assert that the `outcome` is true, naming the assertion with `name`, which will be used as a label in the CLI runner. The `reason` argument
  // will be used to print a message when the assertion fails, this should contain some additional information about values being compared.
  static assert(name: string, outcome: boolean, reason: string) { ... }

  // assert that `x` and `y` are equal, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertEqual(msg: string, x: unknown, y: unknown) { ... }
  
  // assert that `x` and `y` are not equal, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertNotEqual(msg: string, x: unknown, y: unknown) { ... }
}
```

## Usage

Follow the steps to compile this to WebAssembly using the
[Extism `js-pdk` toolchain](https://github.com/extism/js-pdk), in particular,
the instructions to
[**use a bundler**](https://github.com/extism/js-pdk?tab=readme-ov-file#using-with-a-bundler).

Quick steps:

**1. Install `extism-js` compiler:**

```sh
curl -O https://raw.githubusercontent.com/extism/js-pdk/main/install.sh
sh install.sh
```

**2. Create your test script:**

You need an interface file to link the `xtp-list` library, so create `test.d.ts`
and paste this:

```ts
// test.d.ts
declare module "main" {
  export function test(): I32;
}

declare module "xtp:test" {
  interface harness {
    assert(name: PTR, value: I64, reason: PTR);
    call(func: PTR, input: PTR): PTR;
    time(func: PTR, input: PTR): I64;
    group(name: PTR);
    reset();
  }
}
```

Your test will call function exports, but here we demonstrate calling our
`count_vowels` function from an example module:

```javascript
// test.js
import { Test } from "@dylibso/xtp-test";

export function test() {
  const res = Test.callString("count_vowels", "some input");
  const count = JSON.parse(res)["count"];
  Test.assertEqual("count_vowels of 'some input'", count, 4);
  return 0;
}
```

**3. Compile your test and interface to .wasm:**

Once you bundle `test.js` using `esbuild` or something similar, you can compile
your test to .wasm using `extism-js`:

```sh
extism-js dist/test.js -i test.d.ts -o test.wasm
```

**4. Run the test against your plugin:** Once you have your test code as a
`.wasm` module, you can run the test against your plugin using the `xtp` CLI:

### Install `xtp`

```sh
curl https://static.dylibso.com/cli/install.sh | sudo sh
```

### Run the test suite

```sh
xtp plugin test ./plugin-*.wasm --with test.wasm --host host.wasm
#               ^^^^^^^^^^^^^^^        ^^^^^^^^^        ^^^^^^^^^
#               your plugin(s)         test to run      optional mock host functions
```

**Note:** The optional mock host functions must be implemented as Extism
plugins, whose exported functions match the host function signature imported by
the plugins being tested.

## Need Help?

Please reach out via the
[`#xtp` channel on Discord](https://discord.com/channels/1011124058408112148/1220464672784908358).
