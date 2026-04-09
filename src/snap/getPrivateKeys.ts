import { getBIP44AddressKeyDeriver } from "@metamask/key-tree";
import {
  InvalidInputError,
  InternalError,
  UserRejectedRequestError
} from "@metamask/snaps-sdk";
import { remove0x } from "@metamask/utils";

import { ConfirmKeyExport } from "./dialogs/ConfirmKeyExport";
import { getWax } from "../hive/wax";
import {
  getAddressIndex,
  validateKeyIndex
} from "../priviledged-apis/key-management";
import type { KeyIndex, PrivateKeyData } from "../rpc";

const CoinType = 0xbee;

export const getPrivateKeys = async (
  origin: string,
  keys: KeyIndex[]
): Promise<PrivateKeyData[]> => {
  if (!Array.isArray(keys)) {
    throw new InvalidInputError("keys argument must be an array") as Error;
  }
  if (keys.length < 1) {
    throw new InvalidInputError("No keys provided") as Error;
  }
  for (const key of keys) {
    validateKeyIndex(key);
  }

  const confirmExport = await ConfirmKeyExport(origin, keys);

  if (!confirmExport) {
    throw new UserRejectedRequestError(
      "User denied the private key export"
    ) as Error;
  }

  const wax = await getWax();

  const bip44 = await snap.request({
    method: "snap_getBip44Entropy",
    params: {
      coinType: CoinType
    }
  });

  const privateKeys: PrivateKeyData[] = [];

  for (const key of keys) {
    const addressIndex = getAddressIndex(key);
    const accountIndex = key.accountIndex ?? 0;

    const deriveHiveAddress = await getBIP44AddressKeyDeriver(bip44, {
      account: accountIndex,
      change: 0
    });

    const bip44Node = await deriveHiveAddress(addressIndex);
    if (!bip44Node.privateKey) {
      throw new InternalError("No private key found") as Error;
    }

    let privateKeyWif: string;
    try {
      privateKeyWif = wax.convertRawPrivateKeyToWif(
        remove0x(bip44Node.privateKey)
      );
    } catch (error) {
      throw new InternalError("Failed to convert private key to WIF", {
        cause: error instanceof Error ? error.message : String(error)
      }) as Error;
    }

    const data: PrivateKeyData = {
      accountIndex,
      addressIndex,
      privateKey: privateKeyWif
    };
    if (key.role !== undefined) {
      data.role = key.role;
    }
    privateKeys.push(data);
  }

  return privateKeys;
};
