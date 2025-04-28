import base, { createConfig } from "@metamask/eslint-config";
import jest from "@metamask/eslint-config-jest";
import nodejs from "@metamask/eslint-config-nodejs";
import typescript from "@metamask/eslint-config-typescript";

const config = createConfig([
  {
    ignores: ["**/dist/", "node_modules/", "npm-common-config/"]
  },

  {
    extends: base,

    languageOptions: {
      sourceType: "module",
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ["./tsconfig.json"]
      }
    },

    settings: {
      "import-x/extensions": [".js", ".mjs"]
    },

    rules: {
      "prettier/prettier": [
        "error",
        {
          quoteProps: "as-needed",
          singleQuote: false,
          tabWidth: 2,
          trailingComma: "none"
        }
      ]
    }
  },

  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: typescript,

    rules: {
      "prettier/prettier": [
        "error",
        {
          quoteProps: "as-needed",
          singleQuote: false,
          tabWidth: 2,
          trailingComma: "none"
        }
      ],
      "jsdoc/tag-lines": ["error", "never"],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-shadow": ["error", { allow: ["Text"] }]
    }
  },

  {
    files: ["**/*.js", "snap.config.ts"],
    extends: nodejs,

    languageOptions: {
      sourceType: "script"
    }
  },

  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.test.js"],
    extends: [jest, nodejs],

    rules: {
      "@typescript-eslint/unbound-method": "off"
    }
  }
]);

export default config;
