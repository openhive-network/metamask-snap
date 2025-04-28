import type { ITransaction, THexString } from "@hiveio/wax";
import {
  InvalidInputError,
  InternalError,
  UserRejectedRequestError
} from "@metamask/snaps-sdk";

import { ConfirmTransactionSign } from "./dialogs/ConfirmTransactionSign";
import { getTempWallet } from "../hive/beekeeper";
import { getWax } from "../hive/wax";
import {
  importPrivateKeyToWallet,
  validateKeyIndexRole
} from "../priviledged-apis/key-management";
import type { KeyIndex } from "../rpc";

export const signTransaction = async (
  origin: string,
  transaction: string,
  keys: KeyIndex[],
  chainId?: string
): Promise<THexString[]> => {
  if (typeof transaction !== "string") {
    throw new InvalidInputError("Transaction must be a string") as Error;
  }
  if (!Array.isArray(keys)) {
    throw new InvalidInputError("Keys must be an array") as Error;
  }
  if (keys.length < 1) {
    throw new InvalidInputError("No keys provided") as Error;
  }
  for (const key of keys) {
    if (typeof key === "object") {
      validateKeyIndexRole(key);
    } else {
      throw new InvalidInputError("Key data must be an object") as Error;
    }
  }

  const confirmSign = await ConfirmTransactionSign(
    origin,
    transaction,
    keys,
    chainId
  );

  if (!confirmSign) {
    throw new UserRejectedRequestError(
      "User denied the transaction signing"
    ) as Error;
  }

  // The order is important: First create wax, then transaction and if all success then create wallet
  const wax = await getWax(chainId);
  let tx: ITransaction;
  try {
    tx = wax.createTransactionFromJson(transaction);
  } catch (error) {
    throw new InvalidInputError("Invalid transaction format", {
      cause: error instanceof Error ? error.message : String(error)
    }) as Error;
  }
  const wallet = await getTempWallet();

  try {
    const signatures: THexString[] = [];

    for (const key of keys) {
      const publicKey = await importPrivateKeyToWallet(wallet, key);

      try {
        const signature = tx.sign(wallet, publicKey);

        signatures.push(signature);
      } catch (error) {
        throw new InternalError("Failed to sign transaction", {
          cause: error instanceof Error ? error.message : String(error)
        }) as Error;
      }
    }

    return signatures;
  } finally {
    wallet.close();
  }
};
