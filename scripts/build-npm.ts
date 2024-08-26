import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./index.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
  },
  package: {
    // package.json properties
    name: "@dylibso/xtp-test",
    version: Deno.args[0],
    description: "XTP test harness",
    license: "BSD-3-Clause",
    bugs: {
      email: "support@dylibso.com",
    },
  },
  test: false,
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
