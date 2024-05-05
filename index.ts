declare const Host: {
  inputBytes: () => void;
  inputString: () => void;
  outputBytes: (output: any) => void;
  outputString: (output: any) => void;
};

// @ts-ignore
const { call, time, assert, group, reset } = Host.getFunctions();

interface MemoryHandle {
  offset: number;
  length: number;
  free(): void;
  readBuffer(): ArrayBuffer;
  readString(): string;
}

type Input = string | ArrayBuffer | object;

Host.inputBytes = function () {
  throw "Tests do not accept any input";
};

Host.inputString = Host.inputBytes;

Host.outputBytes = function (n: any) {
  throw "Tests should not return any output";
};

Host.outputString = Host.outputBytes;

function convertInput(input: Input): MemoryHandle {
  const ty = typeof input;

  if (ty === "string") {
    // @ts-ignore
    return Memory.fromString(input);
  } else if (input instanceof ArrayBuffer) {
    // @ts-ignore
    return Memory.fromBuffer(input);
  } else {
    // @ts-ignore
    return Memory.fromJsonObject(input);
  }
}

export class Test {
  // call a function from the Extism plugin being tested, passing in `Input` and returning the output as a raw `MemoryHandle`.
  static call(
    funcName: string,
    input: Input,
  ): MemoryHandle {
    // @ts-ignore: Memory
    const a = Memory.fromString(funcName);
    const b = convertInput(input);
    const c = call(a.offset, b.offset);
    a.free();
    b.free();
    // @ts-ignore: Memory
    return Memory.find(c);
  }

  // call a function from the Extism plugin being tested, passing in `Input` and get the number of nanoseconds spent in the function.
  static timeNanoseconds(funcName: string, input: Input): number {
    // @ts-ignore: Memory
    const a = Memory.fromString(funcName);
    const b = convertInput(input);
    const c = time(a.offset, b.offset);
    a.free();
    b.free();
    return c;
  }

  // Reset the loaded plugin, clearing all state.
  static reset() {
    reset();
  }

  static startGroup(name: string) {
    // @ts-ignore: Memory
    const nameMem = Memory.fromString(name);
    group(nameMem.offset);
    nameMem.free();
  }

  // Run a test group, resetting the plugin before and after the group is run.
  static group(name: string, callback: () => void) {
    Test.reset();
    Test.startGroup(name);
    callback();
    Test.reset();
  }

  // call a function from the Extism plugin being tested, passing in `Input` and get the number of seconds spent in the function.
  static timeSeconds(funcName: string, input: Input): number {
    return Test.timeNanoseconds(funcName, input) / 1e9;
  }

  // call a function from the Extism plugin being tested, passing in `Input` and returning the output as a `string`.
  static callString(
    funcName: string,
    input: Input,
  ): string {
    return Test.call(funcName, input).readString();
  }

  // call a function from the Extism plugin being tested, passing in `Input` and returning the output as a `ArrayBuffer`.
  static callBuffer(
    funcName: string,
    input: Input,
  ): ArrayBuffer {
    return Test.call(funcName, input).readBuffer();
  }

  // assert that the `outcome` is true, naming the assertion with `name`, which will be used as a label in the CLI runner. The `reason` argument
  // will be used to print a message when the assertion fails, this should contain some additional information about values being compared.
  static assert(name: string, outcome: boolean, reason: string) {
    // @ts-ignore: Memory
    const a = Memory.fromString(name);
    // @ts-ignore: Memory
    const b = Memory.fromString(reason);
    assert(a.offset, !!outcome, b.offset);
    a.free();
    b.free();
  }

  // assert that `x` and `y` are equal, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertEqual(msg: string, x: unknown, y: unknown) {
    const stack = new Error().stack || "";
    stack.trim();
    Test.assert(msg, x === y, `Expected ${x} === ${y}\n${stack}`);
  }

  // assert that `x` and `y` are not equal, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertNotEqual(msg: string, x: unknown, y: unknown) {
    const stack = new Error().stack || "";
    stack.trim();
    Test.assert(msg, x !== y, `Expected ${x} !== ${y}\n${stack}`);
  }

  // assert that `x` is greater than `y`, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertGreaterThan(msg: string, x: any, y: any) {
    const stack = new Error().stack || "";
    stack.trim();
    Test.assert(msg, x > y, `Expected ${x} > ${y}\n${stack}`);
  }

  // assert that `x` is greater than or equal to `y`, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertGreaterThanOrEqualTo(msg: string, x: any, y: any) {
    const stack = new Error().stack || "";
    stack.trim();
    Test.assert(msg, x >= y, `Expected ${x} >= ${y}\n${stack}`);
  }

  // assert that `x` is less than `y`, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertLessThan(msg: string, x: any, y: any) {
    const stack = new Error().stack || "";
    stack.trim();
    Test.assert(msg, x < y, `Expected ${x} < ${y}\n${stack}`);
  }

  // assert that `x` is less than or equal to `y`, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertLessThanOrEqualTo(msg: string, x: any, y: any) {
    const stack = new Error().stack || "";
    stack.trim();
    Test.assert(msg, x <= y, `Expected ${x} <= ${y}\n${stack}`);
  }
}
