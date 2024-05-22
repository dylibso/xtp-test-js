import { Test } from "../../index.ts";

export function test() {
  const notEmpty = Test.callString("count_vowels", Test.mockInputString());
  Test.assertNotEqual("with mock, not empty", notEmpty, "");

  Test.assertGreaterThan("gt test", 100, 1);
  Test.assertLessThan("lt test", Number.MIN_VALUE, Number.MAX_VALUE);
  Test.assertGreaterThanOrEqualTo("gte test", Math.PI, 3.14);
  Test.assertLessThanOrEqualTo("lte test", 3.14, Math.PI);

  // call a function from some Extism plugin (you'll link these up in the CLI command to run the test),
  // passing in some data and getting back a string (`callString` is a helper for string output)
  const res = Test.callString("count_vowels", "some input");
  const count = JSON.parse(res)["count"];
  // assert the count of the vowels is correct, giving the test case a name (which will be shown in the CLI output)
  Test.assertEqual("count_vowels of 'some input'", count, 4);

  // create a group of tests, which will be run together and reset after the group is complete
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
  const resetOutput = Test.callString("count_vowels", "this is a test");
  const total = JSON.parse(resetOutput)["total"];
  Test.assertEqual("reset plugin has vars cleared", total, 4);

  // this function is also an Extism plugin, so return an int32 value (non-zero returns will cause the whole test suite to fail.)
  return 0;
}
