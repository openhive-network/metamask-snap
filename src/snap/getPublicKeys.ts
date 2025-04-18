import type { KeyIndex, PublicKeyData } from "../rpc";
import { getPublicKeyWifFromKeyIndex } from "../utils/key-management";

export const getPublicKeys = async (
  keys: KeyIndex[]
): Promise<PublicKeyData[]> => {
  const publicKeys: PublicKeyData[] = [];

  for (const key of keys) {
    const publicKey = await getPublicKeyWifFromKeyIndex(key);

    publicKeys.push({
      accountIndex: key.accountIndex ?? 0,
      publicKey,
      role: key.role
    });
  }

  return publicKeys;
};
