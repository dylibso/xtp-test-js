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

  static timeNanoseconds(funcName: string, input: Input): number {
    // @ts-ignore: Memory
    const a = Memory.fromString(funcName);
    const b = convertInput(input);
    const c = time(a.offset, b.offset);
    a.free();
    b.free();
    return c;
  }

  static reset() {
    reset();
  }

  static startGroup(name: string) {
    // @ts-ignore: Memory
    const nameMem = Memory.fromString(name);
    group(nameMem.offset);
    nameMem.free();
  }

  static group(name: string, callback: () => void) {
    Test.reset();
    Test.startGroup(name);
    callback();
    Test.reset();
  }

  static timeSeconds(funcName: string, input: Input): number {
    return Test.timeNanoseconds(funcName, input) / 1e9;
  }

  static callString(
    funcName: string,
    input: Input,
  ): string {
    return Test.call(funcName, input).readString();
  }

  static callBuffer(
    funcName: string,
    input: Input,
  ): ArrayBuffer {
    return Test.call(funcName, input).readBuffer();
  }

  static assert(name: string, value: boolean, reason: string) {
    // @ts-ignore: Memory
    const a = Memory.fromString(name);
    // @ts-ignore: Memory
    const b = Memory.fromString(reason);
    assert(a.offset, !!value, b.offset);
    a.free();
    b.free();
  }

  static assertEqual(msg: string, x: unknown, y: unknown) {
    const stack = new Error().stack;
    stack.trim();
    Test.assert(msg, x === y, `Expected ${x} === ${y}\n${stack}`);
  }

  static assertNotEqual(msg: string, x: unknown, y: unknown) {
    const stack = new Error().stack;
    stack.trim();
    Test.assert(msg, x !== y, `Expected ${x} !== ${y}\n${stack}`);
  }
}
