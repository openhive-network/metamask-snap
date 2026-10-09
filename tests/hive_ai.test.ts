import type {
  SnapConfirmationInterface,
  SnapInterfaceActions
} from "@metamask/snaps-jest";

import {
  installSnapWithMockedNetwork,
  type CapturedRequest,
  type MockReply
} from "./helpers/mockNetwork";

const ORIGIN = "https://dapp.example";
const OTHER_ORIGIN = "https://other.example";
const API_KEY = "sk-ant-test-0123456789abcdef";
const MESSAGES_BODY = {
  model: "claude-sonnet-5",
  messages: [{ role: "user", content: "Hi" }]
};
const PROVIDER_REPLY = { content: [{ type: "text", text: "Hello" }] };

const install = async (
  reply: () => MockReply = () => ({
    status: 200,
    body: JSON.stringify(PROVIDER_REPLY),
    headers: { "content-type": "application/json" }
  })
) => installSnapWithMockedNetwork(reply);

type Snap = Awaited<ReturnType<typeof install>>;

const storeKey = async (
  { request }: Snap,
  origin = ORIGIN,
  params: Record<string, string> = { provider: "anthropic", apiKey: API_KEY }
) => {
  const response = request({ origin, method: "hive_aiStoreKey", params });
  const ui = (await response.getInterface()) as SnapConfirmationInterface;
  await ui.ok();
  return response;
};

const anthropicCall = (origin = ORIGIN, path = "/v1/messages") => ({
  origin,
  method: "hive_aiCall",
  params: { provider: "anthropic", path, body: MESSAGES_BODY }
});

const approvedCall = async (
  snap: Snap,
  origin = ORIGIN,
  allowForMinutes?: string
) => {
  const response = snap.request(anthropicCall(origin));
  const ui = (await response.getInterface()) as SnapConfirmationInterface &
    SnapInterfaceActions;
  if (allowForMinutes !== undefined) {
    await ui.selectInDropdown("allowForMinutes", allowForMinutes);
  }
  await ui.ok();
  return response;
};

describe("onRpcRequest", () => {
  describe("hive_ai*", () => {
    it("should store, list, call with, and forget a provider key", async () => {
      const snap = await install();

      const storeResponse = snap.request({
        origin: ORIGIN,
        method: "hive_aiStoreKey",
        params: { provider: "anthropic", apiKey: API_KEY, label: "work" }
      });
      const storeUi =
        (await storeResponse.getInterface()) as SnapConfirmationInterface;
      expect(storeUi.type).toBe("confirmation");
      const storeContent = JSON.stringify(storeUi.content);
      expect(storeContent).toContain(ORIGIN);
      expect(storeContent).toContain("Anthropic");
      expect(storeContent).not.toContain(API_KEY);
      await storeUi.ok();
      expect(await storeResponse).toRespondWith({
        stored: { provider: "anthropic", label: "work" }
      });

      const listResponse = await snap.request({
        origin: ORIGIN,
        method: "hive_aiListKeys",
        params: {}
      });
      expect(listResponse).toRespondWith({
        keys: [{ provider: "anthropic", label: "work" }]
      });
      expect(JSON.stringify(listResponse.response)).not.toContain(API_KEY);

      const callResponse = snap.request(anthropicCall());
      const callUi =
        (await callResponse.getInterface()) as SnapConfirmationInterface;
      expect(callUi.type).toBe("confirmation");
      const callContent = JSON.stringify(callUi.content);
      expect(callContent).toContain(ORIGIN);
      expect(callContent).toContain("Anthropic");
      expect(callContent).toContain(MESSAGES_BODY.model);
      expect(callContent).not.toContain(API_KEY);
      await callUi.ok();
      const callResult = await callResponse;
      expect(callResult).toRespondWith({ status: 200, body: PROVIDER_REPLY });
      expect(JSON.stringify(callResult.response)).not.toContain(API_KEY);

      expect(snap.requests).toHaveLength(1);
      const outbound = snap.requests[0] as CapturedRequest;
      expect(outbound).toMatchObject({
        url: "https://api.anthropic.com/v1/messages",
        method: "POST",
        redirect: "error"
      });
      expect(outbound.headers["x-api-key"]).toBe(API_KEY);
      expect(outbound.headers["anthropic-version"]).toBe("2023-06-01");
      expect(outbound.headers.authorization).toBeUndefined();
      expect(JSON.parse(String(outbound.body))).toStrictEqual(MESSAGES_BODY);

      expect(
        await snap.request({
          origin: ORIGIN,
          method: "hive_aiForgetKey",
          params: { provider: "anthropic" }
        })
      ).toRespondWith({ forgotten: true });

      expect(await snap.request(anthropicCall())).toRespondWithError({
        code: 4100,
        message: "This site has no API key stored for this provider",
        stack: expect.any(String)
      });
      expect(snap.requests).toHaveLength(1);
    });

    it("should send OpenAI and DeepSeek keys as bearer tokens to their fixed URLs", async () => {
      const snap = await install();

      for (const [provider, path, url] of [
        [
          "openai",
          "/v1/chat/completions",
          "https://api.openai.com/v1/chat/completions"
        ],
        [
          "deepseek",
          "/chat/completions",
          "https://api.deepseek.com/chat/completions"
        ]
      ] as const) {
        await storeKey(snap, ORIGIN, { provider, apiKey: `${provider}-key` });
        const response = snap.request({
          origin: ORIGIN,
          method: "hive_aiCall",
          params: { provider, path, body: { model: "m", messages: [] } }
        });
        const ui = (await response.getInterface()) as SnapConfirmationInterface;
        await ui.ok();
        expect(await response).toRespondWith({
          status: 200,
          body: PROVIDER_REPLY
        });

        const outbound = snap.requests[
          snap.requests.length - 1
        ] as CapturedRequest;
        expect(outbound.url).toBe(url);
        expect(outbound.headers.authorization).toBe(`Bearer ${provider}-key`);
        expect(outbound.headers["x-api-key"]).toBeUndefined();
      }
    });

    it("should keep a key bound to the origin that stored it", async () => {
      const snap = await install();
      await storeKey(snap);

      expect(
        await snap.request({
          origin: OTHER_ORIGIN,
          method: "hive_aiListKeys",
          params: {}
        })
      ).toRespondWith({ keys: [] });

      expect(
        await snap.request(anthropicCall(OTHER_ORIGIN))
      ).toRespondWithError({
        code: 4100,
        message: "This site has no API key stored for this provider",
        stack: expect.any(String)
      });

      expect(
        await snap.request({
          origin: OTHER_ORIGIN,
          method: "hive_aiForgetKey",
          params: { provider: "anthropic" }
        })
      ).toRespondWith({ forgotten: false });

      expect(
        await snap.request({
          origin: ORIGIN,
          method: "hive_aiListKeys",
          params: {}
        })
      ).toRespondWith({ keys: [{ provider: "anthropic" }] });
      expect(snap.requests).toHaveLength(0);
    });

    it("should refuse to store a key when the user rejects the dialog", async () => {
      const snap = await install();

      const response = snap.request({
        origin: ORIGIN,
        method: "hive_aiStoreKey",
        params: { provider: "anthropic", apiKey: API_KEY }
      });
      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      await ui.cancel();

      expect(await response).toRespondWithError({
        code: 4001,
        message: "User denied storing the API key",
        stack: expect.any(String)
      });
      expect(
        await snap.request({
          origin: ORIGIN,
          method: "hive_aiListKeys",
          params: {}
        })
      ).toRespondWith({ keys: [] });
    });

    it("should not call the provider when the user rejects the call dialog", async () => {
      const snap = await install();
      await storeKey(snap);

      const response = snap.request(anthropicCall());
      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      await ui.cancel();

      expect(await response).toRespondWithError({
        code: 4001,
        message: "User denied the AI provider call",
        stack: expect.any(String)
      });
      expect(snap.requests).toHaveLength(0);
    });

    it("should skip the call dialog while the site is allowed", async () => {
      const snap = await install();
      await storeKey(snap);

      expect(await approvedCall(snap, ORIGIN, "15")).toRespondWith({
        status: 200,
        body: PROVIDER_REPLY
      });
      // No dialog: the request resolves without an interface interaction.
      expect(await snap.request(anthropicCall())).toRespondWith({
        status: 200,
        body: PROVIDER_REPLY
      });
      expect(snap.requests).toHaveLength(2);

      // Storing a new key revokes the allowance.
      await storeKey(snap);
      expect(await approvedCall(snap)).toRespondWith({
        status: 200,
        body: PROVIDER_REPLY
      });
      expect(snap.requests).toHaveLength(3);
    });

    it("should ask again for every call when the site is not allowed", async () => {
      const snap = await install();
      await storeKey(snap);

      await approvedCall(snap);
      const response = snap.request(anthropicCall());
      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.ok();
      expect(await response).toRespondWith({
        status: 200,
        body: PROVIDER_REPLY
      });
    });

    it.each([
      "/v1/messages/../v1/complete",
      "/v1/../v1/messages",
      "//evil.example/v1/messages",
      "@evil.example/v1/messages",
      "https://evil.example/v1/messages",
      "/v1/messages?beta=true",
      "/v1/messages/",
      "/v1/chat/completions",
      ""
    ])("should refuse path %p without a network request", async (path) => {
      const snap = await install();
      await storeKey(snap);

      expect(
        await snap.request(anthropicCall(ORIGIN, path))
      ).toRespondWithError({
        code: -32000,
        message: "Path is not allowed for this provider",
        stack: expect.any(String)
      });
      expect(snap.requests).toHaveLength(0);
    });

    it.each(["unknown", "__proto__", "constructor", "toString", 1])(
      "should refuse provider %p without a network request",
      async (provider) => {
        const snap = await install();

        for (const [method, params] of [
          ["hive_aiStoreKey", { provider, apiKey: API_KEY }],
          ["hive_aiForgetKey", { provider }],
          [
            "hive_aiCall",
            { provider, path: "/v1/messages", body: MESSAGES_BODY }
          ]
        ] as const) {
          expect(
            await snap.request({ origin: ORIGIN, method, params })
          ).toRespondWithError({
            code: -32000,
            message: "Unknown AI provider",
            stack: expect.any(String)
          });
        }
        expect(snap.requests).toHaveLength(0);
      }
    );

    it("should refuse malformed keys, labels and bodies", async () => {
      const snap = await install();

      for (const apiKey of ["", "has space", "line\nbreak", 42]) {
        expect(
          await snap.request({
            origin: ORIGIN,
            method: "hive_aiStoreKey",
            params: { provider: "anthropic", apiKey }
          })
        ).toRespondWithError({
          code: -32000,
          message:
            "API key must be 1 to 1024 printable ASCII characters without spaces",
          stack: expect.any(String)
        });
      }

      expect(
        await snap.request({
          origin: ORIGIN,
          method: "hive_aiStoreKey",
          params: { provider: "anthropic", apiKey: API_KEY, label: "" }
        })
      ).toRespondWithError({
        code: -32000,
        message: "Label must be a string of 1 to 64 characters",
        stack: expect.any(String)
      });

      await storeKey(snap);
      for (const body of [null, "text", [1, 2]]) {
        expect(
          await snap.request({
            origin: ORIGIN,
            method: "hive_aiCall",
            params: { provider: "anthropic", path: "/v1/messages", body }
          })
        ).toRespondWithError({
          code: -32000,
          message: "Request body must be a JSON object",
          stack: expect.any(String)
        });
      }
      expect(snap.requests).toHaveLength(0);
    });

    it("should return provider errors with the key redacted", async () => {
      const snap = await install(() => ({
        status: 401,
        body: `invalid x-api-key: ${API_KEY}`
      }));
      await storeKey(snap);

      const response = await approvedCall(snap);
      expect(response).toRespondWith({
        status: 401,
        body: "invalid x-api-key: [redacted]"
      });
    });

    it("should report network failures without the key", async () => {
      const snap = await install(() => ({
        error: `redirect mode is set to error (${API_KEY})`
      }));
      await storeKey(snap);

      const response = await approvedCall(snap);
      expect(response).toRespondWithError({
        code: -32603,
        message: "AI provider request failed",
        stack: expect.any(String)
      });
      expect(JSON.stringify(response.response)).not.toContain(API_KEY);
    });

    it("should refuse a response over 1 MB", async () => {
      const snap = await install(() => ({
        status: 200,
        body: "x".repeat(1024 * 1024 + 1)
      }));
      await storeKey(snap);

      expect(await approvedCall(snap)).toRespondWithError({
        code: -32603,
        message: "AI provider response is too large",
        stack: expect.any(String)
      });
    });
  });
});
