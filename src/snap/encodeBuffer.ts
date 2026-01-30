import {
  InvalidInputError,
  InternalError,
  UserRejectedRequestError
} from "@metamask/snaps-sdk";

import { ConfirmBufferSign } from "./dialogs/ConfirmBufferSign";
import { getTempWallet } from "../hive/beekeeper";
import { getWax } from "../hive/wax";
import {
  keyIndexToPublicKey,
  importPrivateKeyToWallet,
  validateKeyIndex
} from "../priviledged-apis/key-management";
import type { KeyIndex } from "../rpc";

export const encodeBuffer = async (
  origin: string,
  buffer: string | number[],
  firstKey: KeyIndex,
  secondKey?: KeyIndex | string,
  nonce?: number
): Promise<string> => {
  let displayEncodeData = typeof buffer === "string" ? buffer : "";

  if (typeof buffer !== "string") {
    if (Array.isArray(buffer)) {
      displayEncodeData = buffer
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    } else {
      throw new InvalidInputError(
        "Input buffer must be a string or number array - bytes"
      ) as Error;
    }
  }
  if (typeof firstKey !== "object") {
    throw new InvalidInputError("Key data must be an object") as Error;
  }

  validateKeyIndex(firstKey);
  if (typeof secondKey === "object") {
    validateKeyIndex(secondKey);
  }

  const confirmEncode = await ConfirmBufferSign(
    origin,
    displayEncodeData,
    firstKey,
    secondKey,
    typeof buffer === "string" ? undefined : buffer.length
  );

  if (!confirmEncode) {
    throw new UserRejectedRequestError(
      "User denied the buffer encode"
    ) as Error;
  }

  // The order is important: First create wax, then create wallet
  const wax = await getWax();
  const wallet = await getTempWallet();

  try {
    const publicKeyFirstKey = await importPrivateKeyToWallet(wallet, firstKey);

    let publicKeySecondKey: string | undefined;
    if (typeof secondKey === "string") {
      publicKeySecondKey = secondKey;
    } else if (secondKey) {
      publicKeySecondKey = await keyIndexToPublicKey(secondKey);
    }

    try {
      let response: string;

      if (typeof buffer === "string") {
        response = wax.encrypt(
          wallet,
          buffer,
          publicKeyFirstKey,
          publicKeySecondKey,
          nonce
        );
      } else {
        const hashBuffer = await globalThis.crypto.subtle.digest(
          "SHA-256",
          new Uint8Array(buffer)
        );

        const hexDigest = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        response = wallet.signDigest(publicKeyFirstKey, hexDigest);
      }

      return response;
    } catch (error) {
      throw new InternalError("Failed to encrypt", {
        cause: error instanceof Error ? error.message : String(error)
      }) as Error;
    }
  } finally {
    wallet.close();
  }
};
