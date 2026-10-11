import type { SnapConfig } from "@metamask/snaps-cli";
import { relative, resolve, sep } from "path";

const config: SnapConfig = {
  bundler: "webpack",
  input: resolve(__dirname, "src/index.ts"),
  server: {
    port: 8080
  },
  customizeWebpackConfig: (webpackConfig) => {
    webpackConfig.module = webpackConfig.module ?? {};
    webpackConfig.module.rules = webpackConfig.module.rules ?? [];

    webpackConfig.module.rules.push({
      test: /\.wasm$/u,
      type: "asset/inline"
    });

    // Webpack inlines `import.meta.url` (used by the emscripten loaders of wax
    // and beekeeper) as the module's absolute file URL, which would make the
    // bundle, and so the manifest shasum, depend on the checkout path. Inline
    // a URL relative to the project root instead.
    webpackConfig.plugins = webpackConfig.plugins ?? [];
    webpackConfig.plugins.push((compiler) => {
      const { DefinePlugin } = compiler.webpack;
      new DefinePlugin({
        "import.meta.url": DefinePlugin.runtimeValue(({ module }) =>
          JSON.stringify(
            new URL(
              relative(__dirname, module.resource).split(sep).join("/"),
              "file:///"
            ).href
          )
        )
      }).apply(compiler);
    });

    return webpackConfig;
  },
  polyfills: {
    buffer: true
  }
};

export default config;
