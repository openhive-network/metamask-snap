import type { Json } from "@metamask/snaps-sdk";

import type { AiKeyInfo, AiProviderId } from "../rpc";

type StoredKey = {
  origin: string;
  provider: AiProviderId;
  apiKey: string;
  label?: string;
};

type CallGrant = {
  origin: string;
  provider: AiProviderId;
  expiresAt: number;
};

type AiState = {
  aiKeys: StoredKey[];
  aiGrants: CallGrant[];
};

type SnapState = Record<string, Json>;

const readState = async (): Promise<{ raw: SnapState; ai: AiState }> => {
  const raw =
    ((await snap.request({
      method: "snap_manageState",
      params: { operation: "get" }
    })) as SnapState | null) ?? {};

  return {
    raw,
    ai: {
      aiKeys: (raw.aiKeys as StoredKey[] | undefined) ?? [],
      aiGrants: (raw.aiGrants as CallGrant[] | undefined) ?? []
    }
  };
};

const writeState = async (raw: SnapState, ai: AiState): Promise<void> => {
  await snap.request({
    method: "snap_manageState",
    params: {
      operation: "update",
      newState: { ...raw, ...ai } as SnapState
    }
  });
};

const isFor =
  (origin: string, provider: AiProviderId) =>
  (entry: { origin: string; provider: AiProviderId }): boolean =>
    entry.origin === origin && entry.provider === provider;

const isNotFor =
  (origin: string, provider: AiProviderId) =>
  (entry: { origin: string; provider: AiProviderId }): boolean =>
    !isFor(origin, provider)(entry);

/**
 * Store an API key for an origin, replacing the key it stored before for the
 * same provider and revoking that origin's call grants for the provider.
 * @param origin - The origin the key is bound to.
 * @param provider - The provider the key belongs to.
 * @param apiKey - The API key.
 * @param label - An optional label shown when listing keys.
 * @returns The stored key's public description.
 */
export const saveKey = async (
  origin: string,
  provider: AiProviderId,
  apiKey: string,
  label?: string
): Promise<AiKeyInfo> => {
  const { raw, ai } = await readState();

  const entry: StoredKey = { origin, provider, apiKey };
  const info: AiKeyInfo = { provider };
  if (label !== undefined) {
    entry.label = label;
    info.label = label;
  }

  await writeState(raw, {
    aiKeys: [...ai.aiKeys.filter(isNotFor(origin, provider)), entry],
    aiGrants: ai.aiGrants.filter(isNotFor(origin, provider))
  });

  return info;
};

/**
 * List the keys an origin has stored, without the keys themselves.
 * @param origin - The requesting origin.
 * @returns The providers and labels of the origin's keys.
 */
export const listKeys = async (origin: string): Promise<AiKeyInfo[]> => {
  const { ai } = await readState();

  return ai.aiKeys
    .filter((entry) => entry.origin === origin)
    .map(({ provider, label }) =>
      label === undefined ? { provider } : { provider, label }
    );
};

/**
 * Remove an origin's key and call grants for a provider.
 * @param origin - The requesting origin.
 * @param provider - The provider whose key is removed.
 * @returns Whether a key was removed.
 */
export const forgetKey = async (
  origin: string,
  provider: AiProviderId
): Promise<boolean> => {
  const { raw, ai } = await readState();

  const aiKeys = ai.aiKeys.filter(isNotFor(origin, provider));
  await writeState(raw, {
    aiKeys,
    aiGrants: ai.aiGrants.filter(isNotFor(origin, provider))
  });

  return aiKeys.length !== ai.aiKeys.length;
};

/**
 * Get the API key an origin stored for a provider.
 * @param origin - The requesting origin.
 * @param provider - The provider.
 * @returns The API key, or undefined when the origin has none.
 */
export const getApiKey = async (
  origin: string,
  provider: AiProviderId
): Promise<string | undefined> => {
  const { ai } = await readState();

  return ai.aiKeys.find(isFor(origin, provider))?.apiKey;
};

/**
 * Check whether an origin may call a provider without a new approval.
 * @param origin - The requesting origin.
 * @param provider - The provider.
 * @param now - The current time in milliseconds.
 * @returns Whether an unexpired grant exists.
 */
export const hasCallGrant = async (
  origin: string,
  provider: AiProviderId,
  now: number
): Promise<boolean> => {
  const { ai } = await readState();

  return ai.aiGrants.some(
    (grant) => isFor(origin, provider)(grant) && grant.expiresAt > now
  );
};

/**
 * Let an origin call a provider without approval until a time, dropping
 * expired grants.
 * @param origin - The requesting origin.
 * @param provider - The provider.
 * @param now - The current time in milliseconds.
 * @param expiresAt - When the grant ends, in milliseconds.
 */
export const saveCallGrant = async (
  origin: string,
  provider: AiProviderId,
  now: number,
  expiresAt: number
): Promise<void> => {
  const { raw, ai } = await readState();

  await writeState(raw, {
    aiKeys: ai.aiKeys,
    aiGrants: [
      ...ai.aiGrants.filter(
        (grant) => isNotFor(origin, provider)(grant) && grant.expiresAt > now
      ),
      { origin, provider, expiresAt }
    ]
  });
};
