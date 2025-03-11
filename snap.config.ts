import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8080
  },
  experimental: {
    wasm: true
  },
  customizeWebpackConfig: webpackConfig => {
    webpackConfig.module = webpackConfig.module ?? {};
    webpackConfig.module.rules = webpackConfig.module.rules ?? [];

    webpackConfig.module.rules.push({
      test: /\.wasm$/,
      type: "asset/inline"
    });

    return webpackConfig;
  },
  polyfills: {
    buffer: true
  }
};

export default config;
