import type { ISignatureProvider, IWaxBaseInterface } from "@hiveio/wax";
import { base58 } from "@scure/base";

const MEMO_MARKER = "#";
const BASE58_PATTERN = /^[1-9A-HJ-NP-Za-km-z]+$/u;
const PUBLIC_KEY_SIZE = 33;
const KEY_PAIR_SIZE = 2 * PUBLIC_KEY_SIZE;
// nonce (u64) + check (u32) + the varint length of the encrypted payload
const MIN_LEGACY_HEAD_SIZE = 8 + 4 + 1;

const isCompressedPublicKeyAt = (bytes: Uint8Array, offset: number): boolean =>
  bytes[offset] === 0x02 || bytes[offset] === 0x03;

/**
 * Rewrites a memo written in the field order of hive 1.27.5-1.28.6
 * (nonce | check | encrypted | from | to) into the standard order
 * (from | to | nonce | check | encrypted).
 * @param memo - `#`-prefixed base58 memo.
 * @returns The memo in the standard order, or undefined when `memo` doesn't
 * have the legacy layout.
 */
const legacyMemoToStandardOrder = (memo: string): string | undefined => {
  const encoded = memo.slice(MEMO_MARKER.length);
  if (!memo.startsWith(MEMO_MARKER) || !BASE58_PATTERN.test(encoded)) {
    return undefined;
  }

  const bytes = base58.decode(encoded);
  const keysOffset = bytes.length - KEY_PAIR_SIZE;
  if (
    keysOffset < MIN_LEGACY_HEAD_SIZE ||
    !isCompressedPublicKeyAt(bytes, keysOffset) ||
    !isCompressedPublicKeyAt(bytes, keysOffset + PUBLIC_KEY_SIZE)
  ) {
    return undefined;
  }

  const standard = new Uint8Array(bytes.length);
  standard.set(bytes.subarray(keysOffset), 0);
  standard.set(bytes.subarray(0, keysOffset), KEY_PAIR_SIZE);

  return MEMO_MARKER + base58.encode(standard);
};

/**
 * Decrypts a memo in the standard field order or, failing that, in the legacy
 * order hive 1.27.5-1.28.6 wrote. wax's `decrypt` parses the standard order
 * only: hive's dual-format detection lives in `crypto_memo::decrypt`, which
 * wax doesn't call.
 * @param wax - Wax instance.
 * @param wallet - Wallet holding the private key of the memo's `from` or `to` key.
 * @param memo - `#`-prefixed base58 memo.
 * @returns The decrypted content.
 * @throws The error of the standard-order attempt when `memo` doesn't have
 * the legacy layout, otherwise the error of the legacy-order attempt.
 */
export const decryptMemo = async (
  wax: IWaxBaseInterface,
  wallet: ISignatureProvider,
  memo: string
): Promise<string> => {
  try {
    return await wax.decrypt(wallet, memo);
  } catch (error) {
    const standardOrderMemo = legacyMemoToStandardOrder(memo);
    if (standardOrderMemo === undefined) {
      throw error;
    }

    return await wax.decrypt(wallet, standardOrderMemo);
  }
};
