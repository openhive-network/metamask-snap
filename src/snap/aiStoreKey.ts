import {
  InvalidInputError,
  UserRejectedRequestError
} from "@metamask/snaps-sdk";

import { ConfirmAiStoreKey } from "./dialogs/ConfirmAiStoreKey";
import { getProvider } from "../ai/providers";
import { saveKey } from "../ai/state";
import type { AiKeyInfo } from "../rpc";

const API_KEY_PATTERN = /^[\x21-\x7e]{1,1024}$/u;
const MAX_LABEL_LENGTH = 64;

export const aiStoreKey = async (
  origin: string,
  provider: unknown,
  apiKey: unknown,
  label?: unknown
): Promise<AiKeyInfo> => {
  const { id, name } = getProvider(provider);

  if (typeof apiKey !== "string" || !API_KEY_PATTERN.test(apiKey)) {
    throw new InvalidInputError(
      "API key must be 1 to 1024 printable ASCII characters without spaces"
    ) as Error;
  }
  if (
    label !== undefined &&
    (typeof label !== "string" ||
      label.length === 0 ||
      label.length > MAX_LABEL_LENGTH)
  ) {
    throw new InvalidInputError(
      `Label must be a string of 1 to ${MAX_LABEL_LENGTH} characters`
    ) as Error;
  }

  const confirmStore = await ConfirmAiStoreKey(origin, name, label);
  if (!confirmStore) {
    throw new UserRejectedRequestError(
      "User denied storing the API key"
    ) as Error;
  }

  return saveKey(origin, id, apiKey, label);
};
