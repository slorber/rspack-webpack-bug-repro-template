console.log({ __DEP_IS_ENABLED__ });

if (__DEP_IS_ENABLED__) {
  import("some-non-existing-dep").then(console.log);
}
