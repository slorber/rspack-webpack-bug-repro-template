console.log({ __DEP_IS_ENABLED__ });

if (__DEP_IS_ENABLED__) {
  const elkLayout = (await import("@mermaid-js/layout-elk")).default;
  registerLayoutLoaders(elkLayout);
}
