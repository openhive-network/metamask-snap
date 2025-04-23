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
import { type BIP44Node, getBIP44AddressKeyDeriver } from "@metamask/key-tree";
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

const keyIndexToBip44Node = async (keyIndex: KeyIndex): Promise<BIP44Node> => {
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
  return await deriveHiveAddress(keyIndexType);
};

export const getPublicKeyWifFromKeyIndex = async (
  keyIndex: KeyIndex
): Promise<TPublicKey> => {
  const wax = await getWax();

  const bip44Node = await keyIndexToBip44Node(keyIndex);

  const publicKey = wax.convertRawPublicKeyToWif(
    remove0x(bip44Node.compressedPublicKey)
  );

  return publicKey;
};

const getPrivateKeyWifFromKeyIndex = async (
  keyIndex: KeyIndex
): Promise<string> => {
  const wax = await getWax();

  const bip44Node = await keyIndexToBip44Node(keyIndex);

  if (!bip44Node.privateKey) {
    throw new InternalError("No private key found") as Error;
  }

  const wif = wax.convertRawPrivateKeyToWif(remove0x(bip44Node.privateKey));

  return wif;
};

export const importPrivateKeyToWallet = async (
  wallet: IBeekeeperUnlockedWallet,
  keyIndex: KeyIndex
): Promise<TPublicKey> => {
  const privateKeyWif = await getPrivateKeyWifFromKeyIndex(keyIndex);

  const publicKey = await wallet.importKey(privateKeyWif);

  return publicKey;
};
