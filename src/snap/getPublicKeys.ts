import { InvalidInputError } from "@metamask/snaps-sdk";

import {
  getAddressIndex,
  keyIndexToPublicKey,
  validateKeyIndex
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
    validateKeyIndex(key);

    const publicKey = await keyIndexToPublicKey(key);

    const data: PublicKeyData = {
      accountIndex: key.accountIndex ?? 0,
      addressIndex: getAddressIndex(key),
      publicKey
    };
    if (key.role !== undefined) {
      data.role = key.role;
    }
    publicKeys.push(data);
  }

  return publicKeys;
};
