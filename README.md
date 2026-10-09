# Hive Wallet MetaMask Snap

A MetaMask Snap that enables secure Hive blockchain interactions directly through your MetaMask wallet. This Snap allows you to sign Hive transactions using keys derived from your MetaMask wallet's seed phrase.

## Features

- Derive Hive keys from MetaMask wallet
- Sign Hive transactions securely
- Encode / decode buffer using derived Hive keys
- No private key exposure

## Security Considerations

### Required Permissions

This Snap requires the following permissions:

- `snap_getBip44Entropy`: For deriving Hive keys from MetaMask seed phrase
- `endowment:rpc`: For Snap communication with dApps
- `snap_dialog`: For user confirmation when signing transactions or encrypting/decrypting buffer
- `endowment:webassembly`: For WebAssembly support in our Hive libraries: Wax and Beekeeper
- `snap_manageState`: For the AI provider keys (prototype, see [below](#ai-provider-keys-prototype-not-published)); MetaMask encrypts snap state at rest
- `endowment:network-access`: For the AI provider calls the snap makes itself (prototype)

All permissions are used with the principle of least privilege. No private keys are stored in memory or exposed to the client.

### Security Notes

- Keys are derived only when needed and immediately cleared from memory after usage
- The only network requests are the AI provider calls of the `hive_ai*` prototype, to a hard-coded allowlist
- Input validation is performed on all transaction data
- Hive keys are never stored. The only stored secrets are the AI provider keys of the `hive_ai*` prototype, in MetaMask's encrypted snap state

## AI provider keys (prototype, not published)

> [!WARNING]
> This is a prototype. It lives on the `aidev/integration` branch only and is not published to npm or the MetaMask Snaps directory.

The snap can hold a user's AI provider API key and make the provider call itself, so the key never reaches the web page.

| Method | Params | Result |
|---|---|---|
| `hive_aiStoreKey` | `{ provider, apiKey, label? }` | `{ stored: { provider, label? } }` after the user confirms a dialog naming the origin and provider |
| `hive_aiListKeys` | `{}` | `{ keys: [{ provider, label? }] }`, the requesting origin's keys, never the key itself |
| `hive_aiForgetKey` | `{ provider }` | `{ forgotten }` |
| `hive_aiCall` | `{ provider, path, body }` | `{ status, body }` after the user approves a dialog naming the origin, provider and `body.model` |

The call dialog can allow the site for 15 or 60 minutes, so later calls to the same provider skip the dialog until then. Storing a new key or forgetting the key ends the allowance. Calls are request/response only: snap RPC has no stream.

Providers, hard-coded in `src/ai/providers.ts` and never taken from the request:

| `provider` | URL (`path` must match exactly) | Key sent as |
|---|---|---|
| `anthropic` | `https://api.anthropic.com/v1/messages` | `x-api-key` |
| `openai` | `https://api.openai.com/v1/chat/completions` | `Authorization: Bearer` |
| `deepseek` | `https://api.deepseek.com/chat/completions` | `Authorization: Bearer` |

### Threat model

- **The key stays inside the snap.** MetaMask runs the snap in an isolated sandbox. The page sends the key once, to `hive_aiStoreKey`; afterwards it sees only provider responses. No method returns the key, errors never include it, nothing logs it, and any occurrence of it in a provider response body is replaced with `[redacted]`.
- **Keys are bound to the origin that stored them.** Another site cannot list, use or forget them; it gets error `4100` as if no key were stored.
- **The page cannot redirect the key.** The provider's origin, paths and auth header are fixed. A `path` is compared to the allowlist as an exact string, so `..`, `//`, `@`, query strings and other hosts are refused before any request is made. Redirects are refused rather than followed, the response is capped at 1 MB and the request times out after 120 seconds.
- **Every use needs the user.** Storing a key needs approval, and so does each call unless the user allowed the site for a limited time.
- **Not covered:** a site the user approved can spend the key on any request body it likes, and sees everything the provider returns. Keys are stored with MetaMask's snap state encryption, not a separate password.

## Architecture

```txt
├── src/                    # Source code
│   ├── ai/                # AI provider allowlist, key storage and provider calls (prototype)
│   ├── assets/            # Snap assets, e.g. icons
│   ├── hive/              # Hive libraries configuration functions
│   ├── index.ts           # Main Snap entry point
│   ├── rpc.ts             # RPC method types
│   ├── snap/              # RPC method handlers code
│   └── priviledged-apis/  # Only part in Snap's code where we use Bip44 entropy functions
```

## Development Setup

### Prerequisites

- Node.js >= 24
- pnpm = 10.0.0
- [MetaMask Flask](https://metamask.io/flask/)
  - ⚠️ You cannot have other versions of MetaMask installed

### Installation

```bash
# Clone the repository and its submodules
git clone --recurse-submodules https://gitlab.syncad.com/hive/metamask-snap.git

# Install dependencies
pnpm install --ignore-scripts --frozen-lockfile

# Start development server
pnpm start
```

### Building

```bash
# Build the Snap
pnpm build

# Lint the project
pnpm lint

# Run tests
pnpm test
```

## Running

1. Install MetaMask Flask
2. Run `pnpm start`
3. Connect to the Snap, either:
    - See the [demo site](https://auth.openhive.network/) and use our official Snap distribution
    - [Host your own version](https://gitlab.syncad.com/hive/wallet-dapp.git) of the dApp and use `local:http://localhost:8080`
4. Install Snap using dApp
5. Approve the requested permissions
6. Use the Snap to sign Hive transactions, encrypt/decrypt buffers and retrieve your underlying public keys

> [!TIP]
> Here is a quick showcase of how to install and use this Snap with the official dApp: [https://www.youtube.com/watch?v=zKT1GXO6G-0](https://www.youtube.com/watch?v=zKT1GXO6G-0)

## Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch
2. Commit your changes
3. Push to your branch
4. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode guidelines
- Ensure all tests pass
- Add tests for new features
- Update documentation as needed
- Ensure snapper passes: `pnpm prebuild`

## License

[MIT License](LICENSE.md)
