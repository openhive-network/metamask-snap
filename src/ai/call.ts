import { InternalError } from "@metamask/snaps-sdk";
import type { Json } from "@metamask/snaps-sdk";

import type { AiProvider } from "./providers";
import type { AiCallResponse } from "../rpc";

type FetchResponse = Awaited<ReturnType<typeof fetch>>;

const MAX_RESPONSE_BYTES = 1024 * 1024;
const TIMEOUT_MS = 120_000;

const requestFailed = (signal: AbortSignal): Error =>
  new InternalError(
    signal.aborted
      ? "AI provider request timed out"
      : "AI provider request failed"
  ) as Error;

const tooLarge = (): Error =>
  new InternalError("AI provider response is too large") as Error;

const readCappedText = async (
  response: FetchResponse,
  signal: AbortSignal
): Promise<string> => {
  const declaredLength = Number(response.headers.get("content-length"));
  if (declaredLength > MAX_RESPONSE_BYTES) {
    await response.body?.cancel();
    throw tooLarge();
  }
  if (response.body === null) {
    return "";
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let received = 0;

  for (;;) {
    let chunk: ReadableStreamReadResult<Uint8Array>;
    try {
      chunk = await reader.read();
    } catch {
      throw requestFailed(signal);
    }
    if (chunk.done) {
      return text + decoder.decode();
    }

    received += chunk.value.byteLength;
    if (received > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw tooLarge();
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
};

const parseBody = (text: string): Json => {
  try {
    return JSON.parse(text) as Json;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return text;
    }
    throw error;
  }
};

/**
 * POST a JSON body to a provider with the given API key. Redirects are
 * refused, the response is capped at 1 MB and the request times out.
 * @param provider - The allowlisted provider.
 * @param url - The allowlisted URL on the provider's origin.
 * @param apiKey - The API key, sent only in the provider's auth header.
 * @param body - The JSON request body.
 * @returns The response status and body, parsed as JSON when it is JSON.
 * Any occurrence of the API key in the body is redacted.
 * @throws InternalError on network failure, timeout, redirect or an oversized
 * response. The error never carries the key.
 */
export const callProvider = async (
  provider: AiProvider,
  url: string,
  apiKey: string,
  body: Record<string, Json>
): Promise<AiCallResponse> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let response: FetchResponse;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json; charset=utf-8",
          ...provider.authHeaders(apiKey)
        },
        body: JSON.stringify(body),
        redirect: "error",
        credentials: "omit",
        signal: controller.signal
      });
    } catch {
      throw requestFailed(controller.signal);
    }

    if (response.redirected || response.type === "opaqueredirect") {
      throw new InternalError("AI provider redirected the request") as Error;
    }

    const text = await readCappedText(response, controller.signal);

    return {
      status: response.status,
      body: parseBody(text.split(apiKey).join("[redacted]"))
    };
  } finally {
    clearTimeout(timer);
  }
};
