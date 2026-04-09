import {
  installSnap,
  type SnapConfirmationInterface
} from "@metamask/snaps-jest";

describe("onRpcRequest", () => {
  describe("hive_getPrivateKeys", () => {
    it("should successfully export a single private key with role", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [
            {
              accountIndex: 0,
              role: "posting"
            }
          ]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.ok();

      const result = await response;
      expect(result).toRespondWith({
        privateKeys: [
          expect.objectContaining({
            accountIndex: 0,
            addressIndex: 4,
            role: "posting",
            privateKey: expect.stringMatching(/^5[A-Za-z1-9]+$/)
          })
        ]
      });
    });

    it("should successfully export all four role keys", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [
            { accountIndex: 0, role: "owner" },
            { accountIndex: 0, role: "active" },
            { accountIndex: 0, role: "posting" },
            { accountIndex: 0, role: "memo" }
          ]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.ok();

      const result = await response;
      expect(result).toRespondWith({
        privateKeys: [
          expect.objectContaining({
            accountIndex: 0,
            addressIndex: 0,
            role: "owner",
            privateKey: expect.stringMatching(/^5[A-Za-z1-9]+$/)
          }),
          expect.objectContaining({
            accountIndex: 0,
            addressIndex: 1,
            role: "active",
            privateKey: expect.stringMatching(/^5[A-Za-z1-9]+$/)
          }),
          expect.objectContaining({
            accountIndex: 0,
            addressIndex: 4,
            role: "posting",
            privateKey: expect.stringMatching(/^5[A-Za-z1-9]+$/)
          }),
          expect.objectContaining({
            accountIndex: 0,
            addressIndex: 3,
            role: "memo",
            privateKey: expect.stringMatching(/^5[A-Za-z1-9]+$/)
          })
        ]
      });
    });

    it("should export key using custom addressIndex", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [
            {
              accountIndex: 0,
              addressIndex: 5
            }
          ]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.ok();

      const result = await response;
      expect(result).toRespondWith({
        privateKeys: [
          expect.objectContaining({
            accountIndex: 0,
            addressIndex: 5,
            privateKey: expect.stringMatching(/^5[A-Za-z1-9]+$/)
          })
        ]
      });
    });

    it("should export keys with different account indexes", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [
            { accountIndex: 0, role: "posting" },
            { accountIndex: 1, role: "posting" }
          ]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.ok();

      const result = await response;
      expect(result).toRespondWith({
        privateKeys: [
          expect.objectContaining({
            accountIndex: 0,
            addressIndex: 4,
            role: "posting"
          }),
          expect.objectContaining({
            accountIndex: 1,
            addressIndex: 4,
            role: "posting"
          })
        ]
      });

      // Keys for different accounts must differ
      const keys = (result as any).response.result.privateKeys;
      expect(keys[0].privateKey).not.toBe(keys[1].privateKey);
    });

    it("should show confirmation dialog with warning", async () => {
      const { request } = await installSnap();

      const origin = "https://ecency.com";
      const response = request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [{ accountIndex: 0, role: "active" }]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");

      const props = ui.content.props as any;
      // Banner with warning
      const banner = props.children[0];
      expect(banner.props.title).toBe("Private key export");
      expect(banner.props.severity).toBe("warning");
      // Origin shown in the request text
      expect(props.children[1].props.children[0].props.children).toBe(origin);

      await ui.ok();
      await response;
    });

    it("should fail when user rejects export dialog", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [{ accountIndex: 0, role: "posting" }]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.cancel();

      expect(await response).toRespondWithError({
        code: 4001,
        message: "User denied the private key export",
        stack: expect.any(String)
      });
    });

    it("should fail when keys param is not an array", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: {}
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "keys argument must be an array",
        stack: expect.any(String)
      });
    });

    it("should fail when keys param is missing", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPrivateKeys",
        params: {}
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "keys argument must be an array",
        stack: expect.any(String)
      });
    });

    it("should fail when keys array is empty", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: []
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "No keys provided",
        stack: expect.any(String)
      });
    });

    it("should fail when neither role nor addressIndex is provided", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [{ accountIndex: 0 }]
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Either role or addressIndex must be provided",
        stack: expect.any(String)
      });
    });

    it("should fail when invalid role is provided", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [{ accountIndex: 0, role: "invalidrole" }]
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Invalid key index type: invalidrole",
        stack: expect.any(String)
      });
    });

    it("should fail when accountIndex is negative", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [{ accountIndex: -1, role: "active" }]
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Key index account index must not be negative",
        stack: expect.any(String)
      });
    });

    it("should fail when accountIndex is too large", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [{ accountIndex: 0xffffffff1, role: "active" }]
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Key index account index is too large",
        stack: expect.any(String)
      });
    });

    it("should fail when addressIndex is negative", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [{ accountIndex: 0, addressIndex: -1 }]
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Key index address index must not be negative",
        stack: expect.any(String)
      });
    });

    it("should fail when addressIndex is too large", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPrivateKeys",
        params: {
          keys: [{ accountIndex: 0, addressIndex: 0xffffffff1 }]
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Key index address index is too large",
        stack: expect.any(String)
      });
    });
  });
});
