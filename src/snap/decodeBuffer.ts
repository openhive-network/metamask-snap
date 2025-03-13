import type { KeyIndex } from "../rpc";
import { getWax } from "../hive/wax";
import { importPrivateKeyToWallet } from "../utils/key-management";
import { getTempWallet } from "../hive/beekeeper";
import { ConfirmBufferDecode } from "./dialogs/ConfirmBufferDecode";
import type { THexString } from "@hiveio/wax";

export const decodeBuffer = async (origin: string, buffer: THexString, decodeKey: KeyIndex): Promise<string> => {
  const confirmDecode = await ConfirmBufferDecode(origin, buffer, decodeKey);

  if(!confirmDecode)
    throw new Error('User denied the buffer decode');

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
