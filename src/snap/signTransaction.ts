import type { THexString } from "@hiveio/wax";

import { ConfirmTransactionSign } from "./dialogs/ConfirmTransactionSign";
import { getTempWallet } from "../hive/beekeeper";
import { getWax } from "../hive/wax";
import type { KeyIndex } from "../rpc";
import { importPrivateKeyToWallet } from "../utils/key-management";

export const signTransaction = async (
  origin: string,
  transaction: string,
  keys: KeyIndex[],
  chainId?: string
): Promise<THexString[]> => {
  if (keys.length < 1) {
    throw new Error("No keys provided");
  }

  const confirmSign = await ConfirmTransactionSign(
    origin,
    transaction,
    keys,
    chainId
  );

  if (!confirmSign) {
    throw new Error("User denied the transaction signing");
  }

  // The order is important: First create wax, then transaction and if all success then create wallet
  const wax = await getWax(chainId);
  const tx = wax.createTransactionFromJson(transaction);
  const wallet = await getTempWallet();

  try {
    const signatures: THexString[] = [];

    for (const key of keys) {
      const publicKey = await importPrivateKeyToWallet(wallet, key);

      const signature = tx.sign(wallet, publicKey);

      signatures.push(signature);
    }

    return signatures;
  } finally {
    wallet.close();
  }
};
