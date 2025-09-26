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

const babelLoader = {
  test: /\.(?:js|ts)$/,
  exclude: /node_modules/,
  use: {
    loader: "babel-loader",
    options: {
      targets: "defaults",
      presets: [["@babel/preset-env"]],
    },
  },
};

const rspackSwcLoader = {
  test: /\.(?:js|ts)$/,
  exclude: [/node_modules/],
  loader: "builtin:swc-loader",
  options: {
    env: {
      targets: ["node 24.2.0"],
      //       targets: [">0.5%", "not dead", "not op_mini all"],
    },
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: true,
      },
      transform: {
        react: {
          runtime: "automatic",
        },
      },
    },
  },
  type: "javascript/auto",
};

const compiler = bundler({
  mode: "production",
  name: "server",
  cache: true,
  experiments:
    bundlerName === "rspack"
      ? {
          cache: {
            type: "persistent",
            version:
              "server-production-en-3.9.0-15972d87ecb5ffade26e85dddeda10b0",
            buildDependencies: [],
          },
          lazyBarrel: true,
          parallelCodeSplitting: false,
        }
      : {},
  optimization: {
    mergeDuplicateChunks: false,
    minimize: false,
    splitChunks: false,
    concatenateModules: false,
  },
  target: "node24.2",

  entry: {
    entry: "./src/entry.ts",
  },
  module: {
    rules: [bundlerName === "rspack" ? rspackSwcLoader : babelLoader],
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
