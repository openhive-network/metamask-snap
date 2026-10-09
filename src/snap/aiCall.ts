import {
  InvalidInputError,
  UnauthorizedError,
  UserRejectedRequestError
} from "@metamask/snaps-sdk";
import type { Json } from "@metamask/snaps-sdk";

import { ConfirmAiCall } from "./dialogs/ConfirmAiCall";
import { callProvider } from "../ai/call";
import { getProvider, getProviderUrl } from "../ai/providers";
import { getApiKey, hasCallGrant, saveCallGrant } from "../ai/state";
import type { AiCallResponse } from "../rpc";

const isJsonObject = (value: unknown): value is Record<string, Json> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const aiCall = async (
  origin: string,
  provider: unknown,
  path: unknown,
  body: unknown
): Promise<AiCallResponse> => {
  const providerSpec = getProvider(provider);
  const url = getProviderUrl(providerSpec, path);
  if (!isJsonObject(body)) {
    throw new InvalidInputError("Request body must be a JSON object") as Error;
  }

  const apiKey = await getApiKey(origin, providerSpec.id);
  if (apiKey === undefined) {
    throw new UnauthorizedError(
      "This site has no API key stored for this provider"
    ) as Error;
  }

  const now = Date.now();
  if (!(await hasCallGrant(origin, providerSpec.id, now))) {
    const { approved, allowForMinutes } = await ConfirmAiCall(
      origin,
      providerSpec.name,
      typeof body.model === "string" ? body.model : undefined
    );
    if (!approved) {
      throw new UserRejectedRequestError(
        "User denied the AI provider call"
      ) as Error;
    }
    if (allowForMinutes > 0) {
      await saveCallGrant(
        origin,
        providerSpec.id,
        now,
        now + allowForMinutes * 60_000
      );
    }
  }

  return callProvider(providerSpec, url, apiKey, body);
};
