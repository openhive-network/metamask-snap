import type { TPublicKey, TRole } from "@hiveio/wax";
import type { KeyIndex } from "../rpc";
import { getWax } from "../hive/wax";
import { remove0x } from "@metamask/utils";
import { SLIP10Node } from "@metamask/key-tree";
import type { IBeekeeperUnlockedWallet } from "@hiveio/beekeeper";

const KeyIndexToPathMap = {
  owner: 0,
  active: 1,
  memo: 3,
  posting: 4
} as const satisfies Record<TRole, number>;

export const keyIndexToPath = (keyIndex: KeyIndex): string[] => {
  const keyIndexType = KeyIndexToPathMap[keyIndex.role];
  if (keyIndexType === undefined)
    throw new Error(`Invalid key index type: ${keyIndex.role}`);

  return ["m", "48'", "13'", `${keyIndexType}'`, `${keyIndex.accountIndex ?? 0}'`, "0'"];
};

export const getPublicKeyWifFromKeyIndex = async (keyIndex: KeyIndex): Promise<TPublicKey> => {
  const wax = await getWax();

  const bip32 = await snap.request({
    method: 'snap_getBip32PublicKey',
    params: {
      curve: "secp256k1",
      path: keyIndexToPath(keyIndex),
      compressed: true
    }
  });

  const publicKey = wax.convertRawPublicKeyToWif(remove0x(bip32));

  return publicKey;
};

export const getPrivateKeyWifFromKeyIndex = async (keyIndex: KeyIndex): Promise<string> => {
  const wax = await getWax();

  const snapResponse = await snap.request({
    method: 'snap_getBip32Entropy',
    params: {
      curve: "secp256k1",
      path: keyIndexToPath(keyIndex)
    }
  });

  const node = await SLIP10Node.fromJSON(snapResponse);

  if (!node.privateKey)
    throw new Error('No private key found');

  const wif = wax.convertRawPrivateKeyToWif(remove0x(node.privateKey));

  return wif;
};

export const importPrivateKeyToWallet = async (wallet: IBeekeeperUnlockedWallet, keyIndex: KeyIndex): Promise<TPublicKey> => {
  const privateKeyWif = await getPrivateKeyWifFromKeyIndex(keyIndex);

  const publicKey = await wallet.importKey(privateKeyWif);

  return publicKey;
};
