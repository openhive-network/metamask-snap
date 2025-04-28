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

All permissions are used with the principle of least privilege. No private keys are stored in memory or exposed to the client.

### Security Notes

- Keys are derived only when needed and immediately cleared from memory after usage
- No network requests are made
- Input validation is performed on all transaction data
- No sensitive data is stored in browser storage

## Architecture

```txt
├── src/                    # Source code
│   ├── assets/            # Snap assets, e.g. icons
│   ├── hive/              # Hive libraries configuration functions
│   ├── index.ts           # Main Snap entry point
│   ├── rpc.ts             # RPC method types
│   ├── snap/              # RPC method handlers code
│   └── priviledged-apis/  # Only part in Snap's code where we use Bip44 entropy functions
```

## Development Setup

### Prerequisites

- Node.js >= 20.18.1
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
