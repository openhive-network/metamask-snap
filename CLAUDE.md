# Hive Wallet MetaMask Snap

## Project Overview

MetaMask Snap enabling secure Hive blockchain interactions through MetaMask. Derives Hive keys from MetaMask wallet seed phrase (BIP44), signs transactions, and encrypts/decrypts buffers without exposing private keys. Keys are derived on-demand and immediately cleared after use.

**RPC Methods:**
- `hive_getPublicKeys` - Derive public keys (owner, active, memo, posting)
- `hive_signTransaction` - Sign Hive transactions with user confirmation
- `hive_encrypt` / `hive_decrypt` - Buffer encryption/decryption

## Tech Stack

- **Runtime:** Node.js ^20.18.1 or >= 21.2
- **Package Manager:** pnpm 10.0.0 (pinned)
- **Language:** TypeScript 5.5.4 (strict mode)
- **Build:** MetaMask Snaps CLI (webpack-based)
- **Testing:** Jest 29.7 with @metamask/snaps-jest preset

**Key Dependencies:**
- `@hiveio/wax` - Hive key conversion and transaction operations
- `@hiveio/beekeeper` - In-memory wallet for signing
- `@metamask/snaps-sdk` - Core Snap framework
- `@metamask/key-tree` - BIP44 key derivation

## Directory Structure

```
src/
├── index.ts                  # Main RPC request handler
├── rpc.ts                    # RPC method type definitions
├── hive/
│   ├── wax.ts               # WAX instance (cached)
│   └── beekeeper.ts         # Beekeeper session management
├── snap/
│   ├── signTransaction.ts   # Transaction signing
│   ├── getPublicKeys.ts     # Public key derivation
│   ├── encodeBuffer.ts      # Buffer encryption
│   ├── decodeBuffer.ts      # Buffer decryption
│   └── dialogs/             # JSX confirmation dialogs
└── priviledged-apis/
    └── key-management.ts    # BIP44 entropy (ISOLATED - only privileged code)

tests/                        # Jest test files
dist/                         # Build output (bundle.js)
```

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build snap bundle
pnpm start            # Watch mode (dev server on :8080)
pnpm serve            # Serve the snap
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint auto-fix
pnpm test             # Run Jest tests
```

## Key Files

| File | Purpose |
|------|---------|
| `snap.manifest.json` | Snap metadata, permissions (v1.6.0) |
| `snap.config.ts` | Webpack config, WASM inline loader |
| `tsconfig.json` | TypeScript strict mode, ES2020 target |
| `eslint.config.mjs` | ESLint v9 flat config with MetaMask preset |
| `jest.config.js` | Test config with test mnemonic |
| `.gitlab-ci.yml` | CI pipeline (lint, build, test, deploy) |

**Snap Permissions:** `snap_dialog`, `endowment:rpc`, `endowment:webassembly`, `snap_getBip44Entropy`
**BIP44 Path:** `m/44'/3054'/` (coin type 0xbee = Hive)

## Coding Conventions

- **Strict TypeScript** - All strict flags enabled, explicit return types
- **Input validation** - Validate all inputs before processing
- **Resource cleanup** - Close wallets/sessions in finally blocks
- **Error types** - Use `@metamask/snaps-sdk` errors (InvalidInputError, InternalError, UserRejectedRequestError)
- **No stored keys** - Keys derived on-demand, used, then cleared immediately
- **User confirmation** - All sensitive operations require dialog approval

**Linting (zero warnings policy):**
- 2-space indentation
- Double quotes
- No trailing commas
- No unused variables
- Proper null/undefined checks

## CI/CD Notes

**Stages:** `.pre` (lint) -> `build` -> `test` -> `deploy`

**Jobs:**
- `lint` - ESLint with cache
- `build` - Creates dist/bundle.js, runs snapper security analysis
- `test` - Jest with junit.xml output
- `publish_dev_package` - GitLab registry (@hiveio)
- `publish_npmjs_package` - npm registry (main branch only)

**Cache:** `node_modules/` and `.pnpm-store/` keyed on pnpm-lock.yaml

**Base Image:** node:20.18.3
