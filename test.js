const fs = require("fs");
const rspack = require("@rspack/core");
const webpack = require("webpack");

const bundlerName = process.env.BUNDLER;
if (!bundlerName || !["rspack", "webpack"].includes(bundlerName)) {
  throw new Error(`process.env.BUNDLER missing`);
}
if (!["rspack", "webpack"].includes(bundlerName)) {
  throw new Error(`Bad process.env.BUNDLER value=${process.env.BUNDLER}`);
}
const bundler = bundlerName === "rspack" ? rspack : webpack;

const compiler = bundler({
  entry: {
    entry: "./src/entry.js",
  },
  plugins: [
    new bundler.DefinePlugin({
      __DEP_IS_ENABLED__: JSON.stringify(false),
    }),
  ],
  output: {
    filename: `[name].${bundlerName}.js`,
  },
});

async function runCompiler() {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      }
      if (stats.hasErrors()) {
        reject(
          new Error(
            `stats error: ${JSON.stringify(stats.toJson().errors, null, 2)}`,
          ),
        );
      }
      resolve();
    });
  });
}

async function closeCompiler() {
  return new Promise((resolve, reject) => {
    compiler.close((err) => (err ? reject(err) : resolve()));
  });
}

async function runTest() {
  console.log("");
  console.log("");
  console.log("###############################################");
  console.log(`# Using ${bundlerName}`.toUpperCase());
  console.log("#############");
  console.log("");

  await runCompiler();
  await closeCompiler();

  console.log("");
  console.log("SUCCESS");
  console.log("");
}

runTest().catch((e) => {
  console.error("ERROR");
  console.error(e);
  process.exit(1);
});
