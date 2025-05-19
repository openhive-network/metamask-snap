/**
 * @file Key management utilities for Hive and WAX
 * @description This file contains functions to derive keys from BIP44 paths, convert keys to WIF format,
 * and import keys into a wallet. It uses the @metamask/key-tree library for key derivation and
 * the @hiveio/wax library for WAX-specific key conversion.
 *
 * This the only place where MetaMask BIP44 Snap API is used.
 */

import type { IBeekeeperUnlockedWallet } from "@hiveio/beekeeper";
import type { TPublicKey, TRole } from "@hiveio/wax";
import { getBIP44AddressKeyDeriver } from "@metamask/key-tree";
import { InternalError, InvalidInputError } from "@metamask/snaps-sdk";
import { remove0x } from "@metamask/utils";

import { getWax } from "../hive/wax";
import type { KeyIndex } from "../rpc";

const KeyIndexToPathMap = {
  owner: 0,
  active: 1,
  memo: 3,
  posting: 4
} as const satisfies Record<TRole, number>;

const CoinType = 0xbee;

export const validateKeyIndexRole = (keyIndex: KeyIndex): void => {
  if (keyIndex.role === undefined) {
    throw new InvalidInputError("Key index role is not provided") as Error;
  }
  const keyIndexType = KeyIndexToPathMap[keyIndex.role];
  if (keyIndexType === undefined) {
    throw new InvalidInputError(
      `Invalid key index type: ${keyIndex.role}`
    ) as Error;
  }
  if (keyIndex.accountIndex !== undefined && keyIndex.accountIndex < 0) {
    throw new InvalidInputError(
      "Key index account index must not be negative"
    ) as Error;
  }
  if (
    keyIndex.accountIndex !== undefined &&
    keyIndex.accountIndex > 0xffffffff
  ) {
    throw new InvalidInputError(
      "Key index account index is too large"
    ) as Error;
  }
};

export const keyIndexToPublicKey = async (
  keyIndex: KeyIndex
): Promise<string> => {
  validateKeyIndexRole(keyIndex);
  const keyIndexType = KeyIndexToPathMap[keyIndex.role];

  const publicKey = await snap.request({
    method: "snap_getBip32PublicKey",
    params: {
      path: [
        "m",
        "44'",
        `${CoinType}'`,
        `${keyIndex.accountIndex ?? 0}'`,
        "0",
        `${keyIndexType}`
      ],
      curve: "secp256k1",
      compressed: true
    }
  });

  const wax = await getWax();
  const waxPublicKey = wax.convertRawPublicKeyToWif(remove0x(publicKey));

  return waxPublicKey;
};

export const importPrivateKeyToWallet = async (
  wallet: IBeekeeperUnlockedWallet,
  keyIndex: KeyIndex
): Promise<TPublicKey> => {
  validateKeyIndexRole(keyIndex);
  const keyIndexType = KeyIndexToPathMap[keyIndex.role];

  const bip44 = await snap.request({
    method: "snap_getBip44Entropy",
    params: {
      coinType: CoinType
    }
  });

  // Create a function that takes an index and returns an extended private key for m/44'/3054'/accountIndex'/0/address_index
  const deriveHiveAddress = await getBIP44AddressKeyDeriver(bip44, {
    account: keyIndex.accountIndex ?? 0,
    change: 0
  });
  // Derive the second Hive address, which has a proper index.
  const bip44Node = await deriveHiveAddress(keyIndexType);
  if (!bip44Node.privateKey) {
    throw new InternalError("No private key found") as Error;
  }

  const wax = await getWax();

  // Try to convert the private key to WIF format
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

  // Try to import the private key into the wallet in order to sign the transaction or buffer using Hive Beekeeper interface
  try {
    const publicKey = await wallet.importKey(privateKeyWif);

    return publicKey;
  } catch (error) {
    throw new InternalError("Failed to encrypt", {
      cause: error instanceof Error ? error.message : String(error)
    }) as Error;
  }
};
