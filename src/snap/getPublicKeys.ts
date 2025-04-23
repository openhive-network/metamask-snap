import { InvalidInputError } from "@metamask/snaps-sdk";

import {
  getPublicKeyWifFromKeyIndex,
  validateKeyIndexRole
} from "../priviledged-apis/key-management";
import type { KeyIndex, PublicKeyData } from "../rpc";

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
