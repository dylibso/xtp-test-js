import { Test } from "../../index.ts";

export function test() {
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
        4 * (i + 1),
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
