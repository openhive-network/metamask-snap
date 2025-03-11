import type { KeyIndex } from "../rpc";
import { getWax } from "../hive/wax";
import { remove0x } from "@metamask/utils";
import { keyIndexToPath } from "../utils/key-management";
import { getTempWallet } from "../hive/beekeeper";
import { ConfirmBufferDecode } from "./dialogs/ConfirmBufferDecode";
import { SLIP10Node } from "@metamask/key-tree";
import type { THexString } from "@hiveio/wax";

export const decodeBuffer = async (origin: string, buffer: THexString, firstKey: KeyIndex, secondKey?: KeyIndex): Promise<string> => {
  const keys = secondKey ? [ firstKey, secondKey ] : [ firstKey ];

  const confirmDecode = await ConfirmBufferDecode(origin, buffer, keys);

  if(!confirmDecode)
    throw new Error('User denied the buffer decode');

  // The order is important: First create wax, then create wallet
  const wax = await getWax();
  const wallet = await getTempWallet();

  try {
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

      await wallet.importKey(wif);
    }

    const response = wax.decrypt(wallet, buffer);

    return response;
  } finally {
    wallet.close();
  }
};
