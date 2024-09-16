declare const Host: {
  inputBytes: () => void;
  inputString: () => void;
  outputBytes: (output: any) => void;
  outputString: (output: any) => void;
};

// @ts-ignore
const { call, time, assert, group, reset, mock_input } = Host.getFunctions();

interface MemoryHandle {
  offset: number;
  length: number;
  free(): void;
  readBytes(): ArrayBuffer;
  readString(): string;
}

const NULL = new ArrayBuffer(0);

// Provides access to data in Extism memory
export class MemoryView extends DataView {
  // @ts-ignore: TextDecoder
  static #decoder = new TextDecoder();

  constructor(memory?: MemoryHandle) {
    super(memory ? memory.readBytes() : NULL);
  }

  // Returns true when the underlying memory handle is empty or undefined.
  isEmpty(): boolean {
    return this.buffer.byteLength === 0;
  }

  // Get the JSON representation of a value stored in Extism memory
  json(): any {
    try {
      return JSON.parse(this.text());
    } catch (e) {
      const text = this.text();
      throw new Error(`Failed to parse JSON: ${text}. Error: ${e.message}`);
    }
  }

  // Get the string representation of a value stored in Extism memory
  text(): string {
    return MemoryView.#decoder.decode(this.buffer);
  }

  // Read bytes from Extism memory into an ArrayBuffer
  arrayBuffer(): ArrayBufferLike {
    return this.buffer;
  }

  setInt8(_byteOffset: number, _value: number): void {
    throw new Error("Cannot set values on MemoryView");
  }

  setInt16(_byteOffset: number, _value: number, _littleEndian?: boolean): void {
    throw new Error("Cannot set values on MemoryView");
  }

  setInt32(_byteOffset: number, _value: number, _littleEndian?: boolean): void {
    throw new Error("Cannot set values on MemoryView");
  }

  setUint8(_byteOffset: number, _value: number): void {
    throw new Error("Cannot set values on MemoryView");
  }

  setUint16(
    _byteOffset: number,
    _value: number,
    _littleEndian?: boolean,
  ): void {
    throw new Error("Cannot set values on MemoryView");
  }

  setUint32(
    _byteOffset: number,
    _value: number,
    _littleEndian?: boolean,
  ): void {
    throw new Error("Cannot set values on MemoryView");
  }

  setFloat32(
    _byteOffset: number,
    _value: number,
    _littleEndian?: boolean,
  ): void {
    throw new Error("Cannot set values on MemoryView");
  }

  setFloat64(
    _byteOffset: number,
    _value: number,
    _littleEndian?: boolean,
  ): void {
    throw new Error("Cannot set values on MemoryView");
  }

  setBigInt64(
    _byteOffset: number,
    _value: bigint,
    _littleEndian?: boolean,
  ): void {
    throw new Error("Cannot set values on MemoryView");
  }

  setBigUint64(
    _byteOffset: number,
    _value: bigint,
    _littleEndian?: boolean,
  ): void {
    throw new Error("Cannot set values on MemoryView");
  }
}

type Input = string | ArrayBuffer | object | undefined;

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
  } else if (input === undefined) {
    // @ts-ignore
    return Memory.fromString("");
  } else {
    // @ts-ignore
    return Memory.fromJsonObject(input);
  }
}

export class Test {
  // call a function from the Extism plugin being tested, passing in `Input` and returning the output as `MemoryView`, which
  // can be used to convert the type to a JavaScript native value.
  static call(
    funcName: string,
    input: Input,
  ): MemoryView {
    // @ts-ignore: Memory
    const a = Memory.fromString(funcName);
    const b = convertInput(input);
    const c = call(a.offset, b.offset);
    a.free();
    b.free();
    // @ts-ignore: Memory
    return new MemoryView(Memory.find(c));
  }

  // read the mock test input provided by the test runner, returns `MemoryView`.
  // this input is defined in an xtp.toml file, or by the --mock-input-data or --mock-input-file flags.
  static mockInput(): MemoryView {
    const offset = mock_input();
    if (offset === 0) {
      throw new Error(
        "Failed to fetch mock input, not provided by test runner.",
      );
    }
    // @ts-ignore: Memory
    return new MemoryView(Memory.find(offset));
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
    Test.assert(msg, x === y, `Expected ${x} === ${y}\n${stack()}`);
  }

  // assert that `x` and `y` are not equal, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertNotEqual(msg: string, x: unknown, y: unknown) {
    Test.assert(msg, x !== y, `Expected ${x} !== ${y}\n${stack()}`);
  }

  // assert that `x` is greater than `y`, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertGreaterThan(msg: string, x: any, y: any) {
    Test.assert(msg, x > y, `Expected ${x} > ${y}\n${stack()}`);
  }

  // assert that `x` is greater than or equal to `y`, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertGreaterThanOrEqualTo(msg: string, x: any, y: any) {
    Test.assert(msg, x >= y, `Expected ${x} >= ${y}\n${stack()}`);
  }

  // assert that `x` is less than `y`, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertLessThan(msg: string, x: any, y: any) {
    Test.assert(msg, x < y, `Expected ${x} < ${y}\n${stack()}`);
  }

  // assert that `x` is less than or equal to `y`, naming the assertion with `msg`, which will be used as a label in the CLI runner.
  static assertLessThanOrEqualTo(msg: string, x: any, y: any) {
    Test.assert(msg, x <= y, `Expected ${x} <= ${y}\n${stack()}`);
  }
}

const stack = (): string => {
  let stack = new Error().stack || "";
  stack.trim();
  stack = stack.split("\n").slice(1).join("\n");
  return stack;
};
