import {
  InvalidInputError,
  InternalError,
  UserRejectedRequestError
} from "@metamask/snaps-sdk";

import { ConfirmBufferSign } from "./dialogs/ConfirmBufferSign";
import { getTempWallet } from "../hive/beekeeper";
import { getWax } from "../hive/wax";
import {
  getPublicKeyWifFromKeyIndex,
  importPrivateKeyToWallet,
  validateKeyIndexRole
} from "../priviledged-apis/key-management";
import type { KeyIndex } from "../rpc";

export const encodeBuffer = async (
  origin: string,
  buffer: string,
  firstKey: KeyIndex,
  secondKey?: KeyIndex | string,
  nonce?: number
): Promise<string> => {
  if (typeof buffer !== "string") {
    throw new InvalidInputError("Input buffer must be a string") as Error;
  }
  if (typeof firstKey !== "object") {
    throw new InvalidInputError("Key data must be an object") as Error;
  }

  validateKeyIndexRole(firstKey);
  if (typeof secondKey === "object") {
    validateKeyIndexRole(secondKey);
  }

  const confirmEncode = await ConfirmBufferSign(
    origin,
    buffer,
    firstKey,
    secondKey
  );

  if (!confirmEncode) {
    throw new UserRejectedRequestError(
      "User denied the buffer encode"
    ) as Error;
  }

  // The order is important: First create wax, then create wallet
  const wax = await getWax();
  const wallet = await getTempWallet();

  try {
    const publicKeyFirstKey = await importPrivateKeyToWallet(wallet, firstKey);

    let publicKeySecondKey: string | undefined;
    if (typeof secondKey === "string") {
      publicKeySecondKey = secondKey;
    } else if (secondKey) {
      publicKeySecondKey = await getPublicKeyWifFromKeyIndex(secondKey);
    }

    try {
      const response = wax.encrypt(
        wallet,
        buffer,
        publicKeyFirstKey,
        publicKeySecondKey,
        nonce
      );

      return response;
    } catch (error) {
      throw new InternalError("Failed to encrypt", {
        cause: error instanceof Error ? error.message : String(error)
      }) as Error;
    }
  } finally {
    wallet.close();
  }
};
