// Decrypts a memo with wax outside the snap and prints the content:
//   node waxDecrypt.mjs <WIF private key> <#memo>
// wax is ESM-only, so the CommonJS Jest suites run this in a child process.
import createBeekeeper from "@hiveio/beekeeper";
import { createWaxFoundation } from "@hiveio/wax";

const [wifPrivateKey, memo] = process.argv.slice(2);

const wax = await createWaxFoundation();
const beekeeper = await createBeekeeper({ inMemory: true });
const { wallet } = await beekeeper
  .createSession("waxDecrypt")
  .createWallet("waxDecrypt", "waxDecrypt", true);
await wallet.importKey(wifPrivateKey);

process.stdout.write(await wax.decrypt(wallet, memo));
