import type { THexString } from "@hiveio/wax";
import {
  InvalidInputError,
  InternalError,
  UserRejectedRequestError
} from "@metamask/snaps-sdk";

import { ConfirmBufferDecode } from "./dialogs/ConfirmBufferDecode";
import { getTempWallet } from "../hive/beekeeper";
import { getWax } from "../hive/wax";
import {
  importPrivateKeyToWallet,
  validateKeyIndex
} from "../priviledged-apis/key-management";
import type { KeyIndex } from "../rpc";

export const decodeBuffer = async (
  origin: string,
  buffer: THexString,
  decodeKey: KeyIndex
): Promise<string> => {
  if (typeof buffer !== "string") {
    throw new InvalidInputError("Input buffer must be a string") as Error;
  }
  if (typeof decodeKey !== "object") {
    throw new InvalidInputError("Key data must be an object") as Error;
  }

  validateKeyIndex(decodeKey);

  const confirmDecode = await ConfirmBufferDecode(origin, buffer, decodeKey);

  if (!confirmDecode) {
    throw new UserRejectedRequestError(
      "User denied the buffer decode"
    ) as Error;
  }

  // The order is important: First create wax, then create wallet
  const wax = await getWax();
  const wallet = await getTempWallet();

  try {
    await importPrivateKeyToWallet(wallet, decodeKey);

    try {
      const response = wax.decrypt(wallet, buffer);

      return response;
    } catch (error) {
      throw new InternalError("Failed to decrypt", {
        cause: error instanceof Error ? error.message : String(error)
      }) as Error;
    }
  } finally {
    wallet.close();
  }
};
