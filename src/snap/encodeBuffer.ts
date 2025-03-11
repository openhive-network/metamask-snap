import type { KeyIndex } from "../rpc";
import { getWax } from "../hive/wax";
import { remove0x } from "@metamask/utils";
import { keyIndexToPath } from "../utils/key-management";
import { getTempWallet } from "../hive/beekeeper";
import { ConfirmBufferSign } from "./dialogs/ConfirmBufferSign";
import { SLIP10Node } from "@metamask/key-tree";

export const encodeBuffer = async (origin: string, buffer: string, firstKey: KeyIndex, secondKey?: KeyIndex | string): Promise<string> => {
  const confirmDecode = await ConfirmBufferSign(origin, buffer, firstKey, secondKey);

  if(!confirmDecode)
    throw new Error('User denied the buffer decode');

  // The order is important: First create wax, then create wallet
  const wax = await getWax();
  const wallet = await getTempWallet();

  try {
    const firstKeyBip32 = await snap.request({
      method: 'snap_getBip32Entropy',
      params: {
        curve: "secp256k1",
        path: keyIndexToPath(firstKey)
      }
    });
    const nodeFirstKey = await SLIP10Node.fromJSON(firstKeyBip32);
    if (!nodeFirstKey.privateKey)
      throw new Error('No private key found');

    const wifFirstKey = wax.convertRawPrivateKeyToWif(remove0x(nodeFirstKey.privateKey));
    const publicKeyFirstKey = await wallet.importKey(wifFirstKey);

    let publicKeySecondKey: string | undefined;
    if(typeof secondKey === "string")
      publicKeySecondKey = secondKey;
    else if (secondKey) {
      const secondKeyBip32 = await snap.request({
        method: 'snap_getBip32Entropy',
        params: {
          curve: "secp256k1",
          path: keyIndexToPath(secondKey)
        }
      });
      const nodeSecondKey = await SLIP10Node.fromJSON(secondKeyBip32);
      if (!nodeSecondKey.privateKey)
        throw new Error('No private key found');

      const wifSecondKey = wax.convertRawPrivateKeyToWif(remove0x(nodeSecondKey.privateKey));
      publicKeySecondKey = await wallet.importKey(wifSecondKey);
    }

    const response = wax.encrypt(wallet, buffer, publicKeyFirstKey, publicKeySecondKey);

    return response;
  } finally {
    wallet.close();
  }
};
