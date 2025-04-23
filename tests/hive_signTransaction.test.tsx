import {
  installSnap,
  type SnapConfirmationInterface
} from "@metamask/snaps-jest";

describe("onRpcRequest", () => {
  describe("hive_signTransaction", () => {
    it("should successfully sign a transaction with active key", async () => {
      const { request } = await installSnap();

      const transaction =
        '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"transfer_operation","value":{"from":"alice","to":"bob","amount":{"nai": "@@000000021", "precision": 3, "amount": "10"}}}]}';
      const role = "active";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction,
          keys: [
            {
              role,
              accountIndex
            }
          ]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(transaction);
      expect(props.children[2]).toBeNull(); // No custom chain id information
      expect(props.children[4][0].props.children[1].props.children).toBe(role);
      expect(props.children[4][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );

      await ui.ok();

      const result = await response;
      expect(result).toRespondWith({
        signatures: [
          "1f35cc002f32ef076dd7c7bdb6e47b43962bb769f8b7c5bee4735f259c2aa753e35bcaec87129b94a25d4f37f04560fecb0c212af37234cc61a87473dcedb7114f"
        ]
      });
    });

    it("should successfully sign a transaction with posting key", async () => {
      const { request } = await installSnap();

      const transaction =
        '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"comment_operation","value":{"parent_author":"","parent_permlink":"test","author":"alice","permlink":"test-post","title":"Test Post","body":"This is a test post","json_metadata":"{}"}}]}';
      const role = "posting";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction,
          keys: [
            {
              role,
              accountIndex
            }
          ]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.ok();

      const result = await response;
      expect(result).toRespondWith({
        signatures: [
          "20d4aa5493c20e13a0d02f1fd02ae0f87a738a9e28fb903abffcef249444aba7865996ae35725ce528c93c33efc53a51d4b1420dec28c237ef295201396515ccea"
        ]
      });
    });

    it("should successfully sign a transaction with owner key", async () => {
      const { request } = await installSnap();

      const transaction =
        '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"account_update_operation","value":{"account":"alice","owner":{"weight_threshold":1,"account_auths":[],"key_auths":[["STM7dZqKctC8FGfbRbFbZzWcD3hyiGkiqm2zvTkJR63hiK4hRbasJ",1]]},"active":{"weight_threshold":1,"account_auths":[],"key_auths":[["STM61Aj5W2GsLHgicnc7BDAXxhEHRkwaS6MhUyob9t1gUV1HBnN3X",1]]},"posting":{"weight_threshold":1,"account_auths":[],"key_auths":[["STM6Lz7F4qHndy5dKV2GQ94AsF7iFT8i6X7hJqGEKfMsgSyYq6z1F",1]]},"memo_key":"STM7FUkohAwxVdGmkQrmksDZ6icTAMu5344gmVvnLh5CKQwQGEhQF","json_metadata":"{}"}}]}';
      const role = "owner";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction,
          keys: [
            {
              role,
              accountIndex
            }
          ]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.ok();

      const result = await response;
      expect(result).toRespondWith({
        signatures: [
          "1f9be6672e3da0c29750be1debb513299ae283b156f5a3959343c799668cad6de43bd54f6f382ddf3229c9069058f833cfac478955b1ced22cc2a258530bd3211d"
        ]
      });
    });

    it("should successfully sign a transaction with custom chainId", async () => {
      const { request } = await installSnap();

      const transaction =
        '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"transfer_operation","value":{"from":"alice","to":"bob","amount":{"nai": "@@000000021", "precision": 3, "amount": "10"}}}]}';
      const role = "active";
      const accountIndex = 0;
      const chainId = "42";

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction,
          chainId,
          keys: [
            {
              role,
              accountIndex
            }
          ]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(transaction);

      // Check for custom chain ID warning
      const bannerProps = props.children[2].props;
      expect(bannerProps.title).toBe("Custom chain signing");
      expect(bannerProps.severity).toBe("warning");
      expect(bannerProps.children.props.children[3].props.children).toBe(
        chainId
      );
      expect(props.children[4][0].props.children[1].props.children).toBe(role);
      expect(props.children[4][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );

      await ui.ok();

      const result = await response;
      expect(result).toRespondWith({
        signatures: [
          "1f5e677f187ef43c17b1129dbddc3337ce6f09ac95312b1dcfacf76af6a389dd7064b37fd1319df004d6be9d70bbf3bda357c5a6e58ac4ac5c5c1a3a3fda5b9c00"
        ]
      });
    });

    it("should successfully sign a transaction with multiple keys", async () => {
      const { request } = await installSnap();

      const transaction =
        '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"transfer_operation","value":{"from":"alice","to":"bob","amount":{"nai": "@@000000021", "precision": 3, "amount": "10"}}}]}';

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction,
          keys: [
            {
              role: "active",
              accountIndex: 0
            },
            {
              role: "posting",
              accountIndex: 1
            }
          ]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.ok();

      const result = await response;
      expect(result).toRespondWith({
        signatures: [
          "1f35cc002f32ef076dd7c7bdb6e47b43962bb769f8b7c5bee4735f259c2aa753e35bcaec87129b94a25d4f37f04560fecb0c212af37234cc61a87473dcedb7114f",
          "1f7d786a8608182916720d319b1409a27581e26616356760b3f3af5a8409b38b2f14b01716d588bc812b5995c353d66b59ae3557c34eff523ba39315fb6676acb1"
        ]
      });
    });

    it("should fail when user rejects signing dialog", async () => {
      const { request } = await installSnap();

      const transaction =
        '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"transfer_operation","value":{"from":"alice","to":"bob","amount":{"nai": "@@000000021", "precision": 3, "amount": "10"}}}]}';

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction,
          keys: [
            {
              role: "active",
              accountIndex: 0
            }
          ]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.cancel();

      expect(await response).toRespondWithError({
        code: 4001,
        message: "User denied the transaction signing",
        stack: expect.any(String)
      });
    });

    it("should fail when transaction is not a string", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction: {},
          keys: [
            {
              role: "active",
              accountIndex: 0
            }
          ]
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Transaction must be a string",
        stack: expect.any(String)
      });
    });

    it("should fail when keys param is not an array", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction:
            '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"transfer_operation","value":{"from":"alice","to":"bob","amount":{"nai": "@@000000021", "precision": 3, "amount": "10"}}}]}',
          keys: {}
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Keys must be an array",
        stack: expect.any(String)
      });
    });

    it("should fail when keys array is empty", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction:
            '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"transfer_operation","value":{"from":"alice","to":"bob","amount":{"nai": "@@000000021", "precision": 3, "amount": "10"}}}]}',
          keys: []
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "No keys provided",
        stack: expect.any(String)
      });
    });

    it("should fail when key has invalid role", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction:
            '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"transfer_operation","value":{"from":"alice","to":"bob","amount":{"nai": "@@000000021", "precision": 3, "amount": "10"}}}]}',
          keys: [
            {
              role: "invalidrole",
              accountIndex: 0
            }
          ]
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Invalid key index type: invalidrole",
        stack: expect.any(String)
      });
    });

    it("should fail when role is missing from key object", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction:
            '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"transfer_operation","value":{"from":"alice","to":"bob","amount":{"nai": "@@000000021", "precision": 3, "amount": "10"}}}]}',
          keys: [
            {
              accountIndex: 0
            }
          ]
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Key index role is not provided",
        stack: expect.any(String)
      });
    });

    it("should fail with malformed transaction JSON", async () => {
      const { request } = await installSnap();

      const transaction =
        '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"transfer_operation","value":{"from":"alice","to"';

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction,
          keys: [
            {
              role: "active",
              accountIndex: 0
            }
          ]
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.ok();

      expect(await response).toRespondWithError({
        code: -32000,
        message: "Invalid transaction format",
        data: {
          cause: expect.stringContaining("Parse Error")
        },
        stack: expect.any(String)
      });
    });

    it("should fail with negative accountIndex", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction:
            '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"transfer_operation",:"value":{"from":"alice","to":"bob","amount":{"nai": "@@000000021", "precision": 3, "amount": "10"}}}]}',
          keys: [
            {
              role: "active",
              accountIndex: -1
            }
          ]
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Key index account index must not be negative",
        stack: expect.any(String)
      });
    });

    it("should fail with too large accountIndex", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_signTransaction",
        params: {
          transaction:
            '{"ref_block_num":63366,"ref_block_prefix":725696404,"expiration":"2025-04-23T19:38:24","operations":[{"type":"transfer","value":{"from":"alice","to":"bob","amount":{"nai": "@@000000021", "precision": 3, "amount": "10"}}}]}',
          keys: [
            {
              role: "active",
              accountIndex: 0xffffffff1
            }
          ]
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Key index account index is too large",
        stack: expect.any(String)
      });
    });
  });
});
