import { InvalidInputError } from "@metamask/snaps-sdk";

import type { KeyIndex, PublicKeyData } from "../rpc";
import {
  getPublicKeyWifFromKeyIndex,
  validateKeyIndexRole
} from "../utils/key-management";

export const getPublicKeys = async (
  keys: KeyIndex[]
): Promise<PublicKeyData[]> => {
  if (!Array.isArray(keys)) {
    throw new InvalidInputError("keys argument must be an array") as Error;
  }

  const publicKeys: PublicKeyData[] = [];

  for (const key of keys) {
    validateKeyIndexRole(key);

    const publicKey = await getPublicKeyWifFromKeyIndex(key);

    publicKeys.push({
      accountIndex: key.accountIndex ?? 0,
      publicKey,
      role: key.role
    });
  }

  return publicKeys;
};
