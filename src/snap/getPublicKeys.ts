import type { KeyIndex, PublicKeyData } from "../rpc";
import { getWax } from "../hive/wax";
import { remove0x } from "@metamask/utils";
import { keyIndexToPath } from "../utils/key-management";

export const getPublicKeys = async (keys: KeyIndex[]): Promise<PublicKeyData[]> => {
  const wax = await getWax();

  const publicKeys: PublicKeyData[] = [];

  for(const key of keys) {
    const bip32 = await snap.request({
      method: 'snap_getBip32PublicKey',
      params: {
        curve: "secp256k1",
        path: keyIndexToPath(key),
        compressed: true
      }
    });

    const publicKey = wax.convertRawPublicKeyToWif(remove0x(bip32));

    publicKeys.push({
      accountIndex: key.accountIndex ?? 0,
      publicKey,
      role: key.role
    });
  }

  return publicKeys;
};
