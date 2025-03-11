import type { KeyIndex } from "../rpc";
import { getWax } from "../hive/wax";
import { remove0x } from "@metamask/utils";
import { keyIndexToPath } from "../utils/key-management";
import { getTempWallet } from "../hive/beekeeper";
import { ConfirmSign } from "./dialogs/ConfirmSign";
import type { THexString } from "@hiveio/wax";
import { SLIP10Node } from "@metamask/key-tree";

export const signTransaction = async (origin: string, transaction: string, keys: KeyIndex[]): Promise<THexString[]> => {
  if (keys.length < 1)
    throw new Error('No keys provided');

  const confirmSign = await ConfirmSign(origin, transaction, keys);

  if(!confirmSign)
    throw new Error('User denied the transaction');

  // The order is important: First create wax, then transaction and if all success then create wallet
  const wax = await getWax();
  const tx = wax.createTransactionFromJson(transaction);
  const wallet = await getTempWallet();

  try {
    const signatures: THexString[] = [];

    for(const key of keys) {
      const snapResponse = await snap.request({
        method: 'snap_getBip32Entropy',
        params: {
          curve: "secp256k1",
          path: keyIndexToPath(key)
        }
      });

      const node = await SLIP10Node.fromJSON(snapResponse);

      if (!node.privateKey)
        throw new Error('No private key found');

      const wif = wax.convertRawPrivateKeyToWif(remove0x(node.privateKey));

      const publicKey = await wallet.importKey(wif);

      const signature = tx.sign(wallet, publicKey);

      signatures.push(signature);
    }

    return signatures;
  } finally {
    wallet.close();
  }
};
