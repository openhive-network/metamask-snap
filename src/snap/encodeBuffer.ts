import { ConfirmBufferSign } from "./dialogs/ConfirmBufferSign";
import { getTempWallet } from "../hive/beekeeper";
import { getWax } from "../hive/wax";
import type { KeyIndex } from "../rpc";
import {
  getPublicKeyWifFromKeyIndex,
  importPrivateKeyToWallet
} from "../utils/key-management";

export const encodeBuffer = async (
  origin: string,
  buffer: string,
  firstKey: KeyIndex,
  secondKey?: KeyIndex | string
): Promise<string> => {
  const confirmDecode = await ConfirmBufferSign(
    origin,
    buffer,
    firstKey,
    secondKey
  );

  if (!confirmDecode) {
    throw new Error("User denied the buffer encode");
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

    const response = wax.encrypt(
      wallet,
      buffer,
      publicKeyFirstKey,
      publicKeySecondKey
    );

    return response;
  } finally {
    wallet.close();
  }
};
