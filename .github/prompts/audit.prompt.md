# Audit

Here is a concise summary of common bottlenecks and best practices to note when creating new Snaps or dApps, especially related to documentation (README), tsconfig, package.json, and secure coding practices.

---

## Common Bottlenecks and Recommendations for New Snap/dApp Development

### 1. **README Documentation**

- **Required:**
  - Clear project purpose and description.
  - Secure usage guidelines (permissions required and why).
  - Build, test, and deployment instructions.
  - Known limitations and security caveats.
  - Instructions for obtaining and handling sensitive values like API keys.
  - Explicit list and rationale of requested permissions.

- **Nice to Have:**
  - Security recommendations for safe usage.
  - Instructions on how to handle secrets securely.
  - Guidance on upgrading dependencies and auditing vulnerabilities.
  - Contribution guidelines.
  - Notes on compliance with MetaMask Snap policies.

---

### 2. **tsconfig.json and TypeScript Configuration**

- **Required Best Practices:**
  - Use a root `tsconfig.json` that enforces strict type safety:
    - `"strict": true`
    - `"noImplicitAny": true`
    - `"strictBindCallApply": true`
    - `"alwaysStrict": true`
    - `"strictNullChecks": true` (explicit)
    - `"exactOptionalPropertyTypes": true`
    - Ensure `"skipLibCheck": false` to avoid hiding type issues.
  - Consistently use module settings (prefer `"module": "ESNext"` or `"ES2020"`) across packages.
  - Submodule/package-specific `tsconfig.json` files should extend the root config to maintain consistency.

- **Common Issues:**
  - Partial/type-unsafe use of `any`.
  - Missing explicit declaration of strict checker options.
  - Using inconsistent module targets or enabling skipLibCheck in modules.

---

### 3. **package.json Configuration**

- **Required Best Practices:**
  - Pin exact dependency versions instead of caret `^` ranges to ensure reproducible builds.
  - Maintain up-to-date package versions and regularly audit for vulnerabilities (`npm audit fix`).
  - Include author metadata (`"author": { name, email, url }`).
  - Specify minimum required Node.js versions aligned with latest LTS (e.g., `>=18.18.0`).
  - Separate dependencies and devDependencies clearly.

- **Common Issues:**
  - Overly broad or outdated dependencies.
  - Missing author/contact fields.
  - Use of vulnerable/transitive dependencies.

---

### 4. **Security and Code Quality**

- **Private Key Handling:**
  - Avoid storing private keys in plain JavaScript variables/memory.
  - Use MetaMask Snap's `snap_manageState` API to securely store sensitive keys.
  - Use `snap_getBip32PublicKey` instead of deriving public keys from raw private keys when signing is not needed.
  - Implement or integrate with secure key management solutions (key vaults, hardware wallets).

- **Input Validation / Output Encoding:**
  - Strictly validate and sanitize all user inputs and external data.
  - Do not trust unvalidated inputs directly, especially for URL construction or DOM output.
  - Use libraries like DOMPurify for sanitizing HTML inputs.
  - Validate Ethereum addresses, chain IDs, and any blockchain data rigorously.

- **Handling External Calls and Responses:**
  - Validate and verify the structure of response data from external APIs.
  - Use strict typing and interface contracts for API responses.
  - Implement robust error handling & user feedback (no silent failures).
  - Avoid loose equality `==`, prefer strict `===`.
  - Implement rate limiting and abuse prevention to mitigate DoS attacks.
  - Handle fallback for external service failures gracefully.

- **Sensitive Data Management:**
  - Avoid exposed or hardcoded API keys in client-side code.
  - Store API keys encrypted or on the server side; client should fetch via secure API.
  - Clear sensitive data from memory after use.
  - Avoid storing sensitive data like OTPs, passwords, mnemonics in plaintext memory.

- **Error Handling and Logging:**
  - Add global handlers for unhandled promise rejections.
  - Provide meaningful, user-friendly error messages.
  - Avoid empty catch blocks.
  - Enable proper logging with conditional logging levels, ensure logs are enabled in production but scrub sensitive info.

- **Content Security Policy (CSP):**
  - Strengthen CSP; avoid unsafe directives like `'wasm-unsafe-eval'`.
  - Implement strict CSP headers to prevent XSS.

---

### 5. **Manifest & Permissions (for MetaMask Snaps)**

- **Recommended:**
  - Request least privilege permissions necessary.
  - Explicitly document permission rationale in the manifest.
  - Limit `endowment:rpc` access to specific domains or Snap IDs.
  - Avoid broad permissions like `endowment:network-access` without justification.
  - Ensure manifest aligns with MetaMask Snap security guidelines.

---

## Summary Table of Key Points

| Area                   | Required / Best Practice                                  | Common Pitfall                             |
|------------------------|-----------------------------------------------------------|-------------------------------------------|
| README                 | Clear documentation, security notes, permissions list     | Missing author info, vague or missing docs|
| tsconfig.json          | Strict typing, noImplicitAny, strictBindCallApply enabled | Loose typing, skipLibCheck=true, inconsistent configs |
| package.json           | Pin exact versions, author info, updated dependencies      | Caret versions, outdated deps, missing metadata        |
| Private Key Handling   | Use snap_manageState API, snap_getBip32PublicKey           | Private keys in memory, raw handling      |
| Input Validation       | Validate/sanitize all inputs, use DOMPurify                 | Unsanitized inputs, unsafe regex          |
| External API Handling  | Validate API responses, error handling, fallback mechanisms | Weak validation, silent errors           |
| Sensitive Data Storage  | Encrypt API keys, clear memory, no hardcoded secrets      | Keys in client code, memory leaks         |
| Error Handling         | Global rejection handlers, clear user feedback             | Empty catch blocks, silent failures       |
| CSP                    | Strict CSP, no `wasm-unsafe-eval`                          | Weak CSP policies                         |
| Manifest Permissions   | Least privilege, documented rationale                       | Over-broad permissions, missing justifications |

---

## Conclusion

When building new MetaMask Snaps or dApps, adhere to strict security and code quality standards to avoid common pitfalls. This includes comprehensive input validation and sanitization, secure management of cryptographic keys, robust TypeScript configurations for static typing, cautious dependency management, prudent permission requests, and comprehensive user-facing documentation.

Following these guidelines will reduce vulnerabilities like XSS, insecure storage, replay attacks, and unwanted privilege escalation, delivering more secure and maintainable Snap/dApp solutions.

---

If you want, I can also help you draft a sample README template or tsconfig.json skeleton that integrates these best practices.
