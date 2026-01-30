import { installSnap } from "@metamask/snaps-jest";

describe("onRpcRequest", () => {
  describe("hive_getPublicKeys", () => {
    it("should successfully call get public keys with empty keys array", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: []
        }
      });

      expect(response).toRespondWith({
        publicKeys: []
      });
    });

    it('should successfully retrieve a single Hive public key with account index 0 and role "memo"', async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [
            {
              accountIndex: 0,
              role: "memo"
            }
          ]
        }
      });

      expect(response).toRespondWith({
        publicKeys: [
          {
            accountIndex: 0,
            addressIndex: 3,
            role: "memo",
            publicKey: "STM7FUkohAwxVdGmkQrmksDZ6icTAMu5344gmVvnLh5CKQwQGEhQF"
          }
        ]
      });
    });

    it("should successfully retrieve a single Hive public key without account index specified (defaults to 0)", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [
            {
              role: "active"
            }
          ]
        }
      });

      expect(response).toRespondWith({
        publicKeys: [
          {
            accountIndex: 0,
            addressIndex: 1,
            role: "active",
            publicKey: "STM61Aj5W2GsLHgicnc7BDAXxhEHRkwaS6MhUyob9t1gUV1HBnN3X"
          }
        ]
      });
    });

    it("should successfully retrieve all Hive public key roles with account index 0", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [
            { accountIndex: 0, role: "owner" },
            { accountIndex: 0, role: "active" },
            { accountIndex: 0, role: "posting" },
            { accountIndex: 0, role: "memo" }
          ]
        }
      });

      expect(response).toRespondWith({
        publicKeys: [
          {
            accountIndex: 0,
            addressIndex: 0,
            role: "owner",
            publicKey: "STM7dZqKctC8FGfbRbFbZzWcD3hyiGkiqm2zvTkJR63hiK4hRbasJ"
          },
          {
            accountIndex: 0,
            addressIndex: 1,
            role: "active",
            publicKey: "STM61Aj5W2GsLHgicnc7BDAXxhEHRkwaS6MhUyob9t1gUV1HBnN3X"
          },
          {
            accountIndex: 0,
            addressIndex: 4,
            role: "posting",
            publicKey: "STM6Lz7F4qHndy5dKV2GQ94AsF7iFT8i6X7hJqGEKfMsgSyYq6z1F"
          },
          {
            accountIndex: 0,
            addressIndex: 3,
            role: "memo",
            publicKey: "STM7FUkohAwxVdGmkQrmksDZ6icTAMu5344gmVvnLh5CKQwQGEhQF"
          }
        ]
      });
    });

    it("should successfully retrieve all Hive public key roles with account index 1", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [
            { accountIndex: 1, role: "owner" },
            { accountIndex: 1, role: "active" },
            { accountIndex: 1, role: "posting" },
            { accountIndex: 1, role: "memo" }
          ]
        }
      });

      expect(response).toRespondWith({
        publicKeys: [
          {
            accountIndex: 1,
            addressIndex: 0,
            role: "owner",
            publicKey: "STM8W38yG8TUs7KoypabGXhrBbWkG5WzWgqMhpXRmUU8mkpNfybjZ"
          },
          {
            accountIndex: 1,
            addressIndex: 1,
            role: "active",
            publicKey: "STM7j898arSoy2M7s2UQEJrUQdMiWrRcQd5eNjHSpa6VoR38Qsass"
          },
          {
            accountIndex: 1,
            addressIndex: 4,
            role: "posting",
            publicKey: "STM6KCnC7yPRyFUSZBcMxvNKe1BhVy5mgeDBjEpuAC3nPBe7puXKA"
          },
          {
            accountIndex: 1,
            addressIndex: 3,
            role: "memo",
            publicKey: "STM6wzoSz4UEYb4dq8sBJGWcSssmihkBm1f7XkXyXo9jBuH4zvwP2"
          }
        ]
      });
    });

    it("should successfully retrieve all Hive public key roles with different account indexes", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [
            { accountIndex: 0, role: "owner" },
            { accountIndex: 1, role: "active" },
            { accountIndex: 2, role: "posting" },
            { accountIndex: 3, role: "memo" }
          ]
        }
      });

      expect(response).toRespondWith({
        publicKeys: [
          {
            accountIndex: 0,
            addressIndex: 0,
            role: "owner",
            publicKey: "STM7dZqKctC8FGfbRbFbZzWcD3hyiGkiqm2zvTkJR63hiK4hRbasJ"
          },
          {
            accountIndex: 1,
            addressIndex: 1,
            role: "active",
            publicKey: "STM7j898arSoy2M7s2UQEJrUQdMiWrRcQd5eNjHSpa6VoR38Qsass"
          },
          {
            accountIndex: 2,
            addressIndex: 4,
            role: "posting",
            publicKey: "STM815feFpPR2eBsmhkzTwQDmomKYNWQMSUg9kndoQxT5U6FyqfDT"
          },
          {
            accountIndex: 3,
            addressIndex: 3,
            role: "memo",
            publicKey: "STM7nDHEMYgpecxhAsFiTVddvHTneN1QArpTV8vqgmRjka6eAYBhz"
          }
        ]
      });
    });

    it("should successfully retrieve a public key using custom addressIndex", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [
            {
              accountIndex: 0,
              addressIndex: 5
            }
          ]
        }
      });

      expect(response).toRespondWith({
        publicKeys: [
          {
            accountIndex: 0,
            addressIndex: 5,
            publicKey: "STM66mv7SassNLQbKoVMPF23herxDdQTN9KaiDokczyTqd7nZYDZv"
          }
        ]
      });
    });

    it("should use addressIndex over role when both are provided", async () => {
      const { request } = await installSnap();

      const origin = "Jest";

      // Request with addressIndex=0 and role="memo" (which maps to 3)
      // addressIndex should take precedence, so we get the owner key (address index 0)
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [
            {
              accountIndex: 0,
              role: "memo",
              addressIndex: 0
            }
          ]
        }
      });

      expect(response).toRespondWith({
        publicKeys: [
          {
            accountIndex: 0,
            addressIndex: 0,
            role: "memo",
            publicKey: "STM7dZqKctC8FGfbRbFbZzWcD3hyiGkiqm2zvTkJR63hiK4hRbasJ"
          }
        ]
      });
    });

    it("should successfully retrieve a public key using addressIndex matching a known role", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      // addressIndex=3 is the same as role="memo"
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [
            {
              accountIndex: 0,
              addressIndex: 3
            }
          ]
        }
      });

      expect(response).toRespondWith({
        publicKeys: [
          {
            accountIndex: 0,
            addressIndex: 3,
            publicKey: "STM7FUkohAwxVdGmkQrmksDZ6icTAMu5344gmVvnLh5CKQwQGEhQF"
          }
        ]
      });
    });

    it("should fail to retrieve the public key when invalid unsupported role provided", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [{ accountIndex: 0, role: "invalidrole" }]
        }
      });

      expect(response).toRespondWithError({
        message: "Invalid key index type: invalidrole",
        code: -32000,
        stack: expect.any(String)
      });
    });

    it("should fail when neither role nor addressIndex is provided", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [{ accountIndex: 0 }]
        }
      });
      expect(response).toRespondWithError({
        message: "Either role or addressIndex must be provided",
        code: -32000,
        stack: expect.any(String)
      });
    });

    it("should fail when accountIndex is too large", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [{ accountIndex: 0xffffffff1, role: "active" }]
        }
      });

      expect(response).toRespondWithError({
        message: "Key index account index is too large",
        code: -32000,
        stack: expect.any(String)
      });
    });

    it("should fail when accountIndex is negative", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [{ accountIndex: -1, role: "active" }]
        }
      });

      expect(response).toRespondWithError({
        message: "Key index account index must not be negative",
        code: -32000,
        stack: expect.any(String)
      });
    });

    it("should fail when addressIndex is negative", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [{ accountIndex: 0, addressIndex: -1 }]
        }
      });

      expect(response).toRespondWithError({
        message: "Key index address index must not be negative",
        code: -32000,
        stack: expect.any(String)
      });
    });

    it("should fail when addressIndex is too large", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: [{ accountIndex: 0, addressIndex: 0xffffffff1 }]
        }
      });

      expect(response).toRespondWithError({
        message: "Key index address index is too large",
        code: -32000,
        stack: expect.any(String)
      });
    });

    it("should fail when keys param is missing", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {}
      });

      expect(response).toRespondWithError({
        message: "keys argument must be an array",
        code: -32000,
        stack: expect.any(String)
      });
    });

    it("should fail when keys param is not an array", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_getPublicKeys",
        params: {
          keys: {}
        }
      });

      expect(response).toRespondWithError({
        message: "keys argument must be an array",
        code: -32000,
        stack: expect.any(String)
      });
    });
  });
});
