import type { SnapConfig } from "@metamask/snaps-cli";
import { resolve } from "path";

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

    return webpackConfig;
  },
  polyfills: {
    buffer: true
  }
};

export default config;
