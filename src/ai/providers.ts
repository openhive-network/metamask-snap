import { InvalidInputError } from "@metamask/snaps-sdk";

import type { AiProviderId } from "../rpc";

export type AiProvider = {
  id: AiProviderId;
  name: string;
  origin: string;
  paths: readonly string[];
  authHeaders: (apiKey: string) => Record<string, string>;
};

const PROVIDERS: Readonly<Record<AiProviderId, AiProvider>> = {
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    origin: "https://api.anthropic.com",
    paths: ["/v1/messages"],
    authHeaders: (apiKey) => ({
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      // The snap runs in a browser context, which Anthropic refuses unless
      // the caller opts in explicitly.
      "anthropic-dangerous-direct-browser-access": "true"
    })
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    origin: "https://api.openai.com",
    // A template literal: snapper reports this string literal as base64.
    paths: [`/v1/chat/completions`],
    authHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` })
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    origin: "https://api.deepseek.com",
    paths: ["/chat/completions"],
    authHeaders: (apiKey) => ({ authorization: `Bearer ${apiKey}` })
  }
};

/**
 * Look up an allowlisted AI provider.
 * @param provider - The provider id taken from the request.
 * @returns The provider's fixed configuration.
 * @throws InvalidInputError if the provider is not allowlisted.
 */
export const getProvider = (provider: unknown): AiProvider => {
  if (
    typeof provider !== "string" ||
    !Object.prototype.hasOwnProperty.call(PROVIDERS, provider)
  ) {
    throw new InvalidInputError("Unknown AI provider") as Error;
  }

  return PROVIDERS[provider as AiProviderId];
};

/**
 * Build the request URL for an allowlisted provider path.
 * @param provider - The provider to call.
 * @param path - The path taken from the request. It must equal one of the
 * provider's allowed paths exactly.
 * @returns The absolute URL on the provider's fixed origin.
 * @throws InvalidInputError if the path is not allowlisted.
 */
export const getProviderUrl = (provider: AiProvider, path: unknown): string => {
  if (typeof path !== "string" || !provider.paths.includes(path)) {
    throw new InvalidInputError(
      "Path is not allowed for this provider"
    ) as Error;
  }

  const url = new URL(path, provider.origin);
  // The allowlist is exact strings, so this only guards against a bad entry.
  if (url.origin !== provider.origin || url.pathname !== path) {
    throw new InvalidInputError(
      "Path is not allowed for this provider"
    ) as Error;
  }

  return url.toString();
};
