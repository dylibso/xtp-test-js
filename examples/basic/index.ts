import { Test } from "../../index.ts";

export function test() {
  const notEmpty = Test.call("count_vowels", Test.mockInput()).text();
  Test.assertNotEqual("with mock, not empty", notEmpty, "");

  Test.assertGreaterThan("gt test", 100, 1);
  Test.assertLessThan("lt test", Number.MIN_VALUE, Number.MAX_VALUE);
  Test.assertGreaterThanOrEqualTo("gte test", Math.PI, 3.14);
  Test.assertLessThanOrEqualTo("lte test", 3.14, Math.PI);

  // call a function from some Extism plugin (you'll link these up in the CLI command to run the test),
  // passing in some data and getting back a JSON value
  const res = Test.call("count_vowels", "some input").json();
  const count = res["count"];
  // assert the count of the vowels is correct, giving the test case a name (which will be shown in the CLI output)
  Test.assertEqual("count_vowels of 'some input'", count, 4);

  // create a group of tests, which will be run together and reset after the group is complete
  Test.group("count_vowels maintains state", () => {
    let accumTotal = 0;
    const expectedFinalTotal = 12;
    for (let i = 0; i < 3; i++) {
      const output = Test.call("count_vowels", "this is a test").json();
      accumTotal += output.count;
      Test.assertEqual(
        `total count increased to: ${accumTotal}`,
        accumTotal,
        output.total,
      );
    }

    Test.assertEqual(
      "expected total reached by end of test",
      accumTotal,
      expectedFinalTotal,
    );
  });

  // internal check that `reset` is done after the group above has executed
  const resetOutput = Test.call("count_vowels", "this is a test").json();
  const total = resetOutput["total"];
  Test.assertEqual("reset plugin has vars cleared", total, 4);

  // test using `MemoryData.arrayBuffer` to read an ArrayBuffer from Extism memory
  const outputBytes = Test.call("count_vowels", "hello, world").arrayBuffer();
  Test.assertEqual(
    "bytes from output are expected length",
    outputBytes.byteLength,
    43,
  );

  // this function is also an Extism plugin, so return an int32 value (non-zero returns will cause the whole test suite to fail.)
  return 0;
}
