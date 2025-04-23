import type { THexString } from "@hiveio/wax";
import {
  InvalidInputError,
  UserRejectedRequestError
} from "@metamask/snaps-sdk";

import { ConfirmBufferDecode } from "./dialogs/ConfirmBufferDecode";
import { getTempWallet } from "../hive/beekeeper";
import { getWax } from "../hive/wax";
import type { KeyIndex } from "../rpc";
import {
  importPrivateKeyToWallet,
  validateKeyIndexRole
} from "../utils/key-management";

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

  validateKeyIndexRole(decodeKey);

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

    const response = wax.decrypt(wallet, buffer);

    return response;
  } finally {
    wallet.close();
  }
};
