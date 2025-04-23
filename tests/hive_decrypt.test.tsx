import {
  installSnap,
  type SnapConfirmationInterface
} from "@metamask/snaps-jest";

describe("onRpcRequest", () => {
  describe("hive_decrypt", () => {
    it("should successfully decrypt a buffer using memo key - implicit account index 0", async () => {
      const { request } = await installSnap();

      const encryptedBuffer =
        "#111111114nr3f4fuhkhDsMaueiLLqSjLYCne6pBT67vLvkNN6kGskRXZv6cfpPqscHKK8KBPXUdpcyYbqj1D2HvB7fxdWc7Db32swnHeyQiXtv4kPbM3AmpLfBnVTuC";
      const role = "memo";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_decrypt",
        params: {
          buffer: encryptedBuffer,
          firstKey: {
            role
          }
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(encryptedBuffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );

      await ui.ok();

      expect(await response).toRespondWith({
        buffer: "Hello world"
      });
    });

    it("should successfully decrypt a buffer using active key", async () => {
      const { request } = await installSnap();

      const encryptedBuffer =
        "#111111117yqGc5E9CHFw1Q7NPiUJfgUZw1RLs4DhqjZhf5G7es6CQPreDvoTfQCjmyVx9HpkFsZSofjZsxLTULuhPqUZMq1kXCfBRfDabrLrzmqwWH6YM7sSC42uDuA";
      const role = "active";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_decrypt",
        params: {
          buffer: encryptedBuffer,
          firstKey: {
            role,
            accountIndex
          }
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(encryptedBuffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );

      await ui.ok();

      expect(await response).toRespondWith({
        buffer: "Hello world"
      });
    });

    it("should successfully decrypt a buffer with explicit account index", async () => {
      const { request } = await installSnap();

      const encryptedBuffer =
        "#11111111GYeDYrsrBrR7NzNFVbRSqxo3SqER8KRBRvueAbKJiEdc9JHFwFGXME8rW5Q7yLmzyFqhR75Qm4sneYgoGV4AahmWvvTtU3RScUBadbKNZyxV1hs72GNk1e2";
      const role = "memo";
      const accountIndex = 1;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_decrypt",
        params: {
          buffer: encryptedBuffer,
          firstKey: {
            role,
            accountIndex
          }
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(encryptedBuffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );

      await ui.ok();

      expect(await response).toRespondWith({
        buffer: "Hello world"
      });
    });

    it("should successfully decrypt an empty buffer", async () => {
      const { request } = await installSnap();

      const encryptedBuffer =
        "#111111114nr3f4fHNY7j1nKU73F9uJdAfGB4gNDKe7VUEZtdpAMhVFGu1edfHveG4sYeHqkeP1gJpDZ4g57DyktxXd1SgDfenrm4vSizBVjZKyge15FGxUC4E5huH4W";
      const role = "memo";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_decrypt",
        params: {
          buffer: encryptedBuffer,
          firstKey: {
            role,
            accountIndex
          }
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(encryptedBuffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );

      await ui.ok();

      expect(await response).toRespondWith({
        buffer: ""
      });
    });

    it("should successfully decrypt a large buffer", async () => {
      const { request } = await installSnap();

      const encryptedBuffer =
        "#111111116f8Tdwa2mKy1zi6q9egTkiMGvW4gTgTwgLH1b47nmKkDcxXLcM4Tu7aFkEq3dME18ULJg862bcnAydHxYbeft8Nff41sgHXvrVn681VF1p3BCpY7FsrvcV9hxeFn3akhRD1qeWpYSQDrnA8gvZtTmDB7TqdwB5zgmp8g6AMeyKNmxiRi5AqrM2MmjEQfScRYT8ojJyXiVyKVsxtifEY8ynven7BgnMBse1vrdeKLw1wRMj1rarCNLzHEPqW8Rzhfac9Yae2hbu4t9LpDrhN8vM2mu4ysKBogV5aXnEKtjbXYXxku5VN3n1p6T4cRePGzsxnoctmjbCeMDoY7vCwbZACXKaYivH8Lpyzm4sho2fwPGMZPCWoBskjFrxdyFb4kVemhat8AX1TUvy6y2DaE8rrGCWef1uR9PUBRos5x4eGu7AdKiXwwcZQej7caad1JpYWruwZJEuyyhs7k8oydkV9aDCjMos9giX7XhEJXe31zFJ87QVoEdrXHY4BHNuUdaQpTYtsfjmrHW5gD4ATj79GYJTcnjMWdf8LMFVvscYMqpWMSd5ru7xGk1Cbco7nPKJV8k4GynBCXe4uWu8d4E6tkfWBpqmwvdbknU6WbTEaBrtet6SizYvGzVSfUMwzn23FULFTEjshTCEiXXhu7h2a9cFfCLDWWhZQ4DHqYM55TzyrvqPg8vAH7ToAA49M2HbZ5kEbwiiiZoWpYabSLQaA77qyEV2EMPEGdDeH8r9GCKTAndw8zmArJkjEewbD8prA74NwVzUHgCgcnvFnAZtZYTi7mpmNNDYmFB9LMyXEM97Uw748ZwNraGE3cBANAnrtNgif9iwmUVG6sZRSGd71D3LUewDxm3tAAz6xpqBJ1vL6yMTP2pL8TnZuTQq4Hffy7h7cTDuXgWuHL2iqaSzDgspMRqbqWmPXvxR4tN1YURu5P6UjQ7QvbafSkceKqCgLvbnyntWCXZ8Ma6NkP3Zjo3AZ1hHH7VLLAy1otiwwaQGLxTm3pkkEK5t5MKbzATtri1wH5Eecp5yWBMbLpxN7TKmLWH315mdBoxfiforAkMV6S3qtMQc1E2c8mQmiyQSCjFYmr6Ztpi5oWwh3BGTAC23EQ2ZkfqYmxMCQqAXAAqXgRbVAD7bXwsN8SH8rMwPjba6nMtSW1adsGXqKRy4WMmtsCpVVCxid3KzQ2quyrpeeou6Sq38NoSk6NsrrkatY5qjioZoRm5q1TDWfrMDmp29kMdEVzYsCqJh8grsJGsbhb6c71gU1fiB2sJJ8Lw25T3PRc7zvDnz8jmhTQUudYsF3p5JuRQZSFhRBn9YRcb6B5ZPC9GYxBKNXEDgWVhf6G1a2e6PhV2Qmm9amT7bRnAJ6ocJpoAunqYcdRFcNv7TmxekobaJMQKYX2yqU5GgzLyuQ1zt6NmYxFEHMwEtX5pQBDYXGTnKbgzYeemfBxwsw1RcAeWpGKrUssofRjaTL";
      const role = "memo";
      const accountIndex = 0;
      // 1000 character string
      const expectedDecrypted = "A".repeat(1000);

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_decrypt",
        params: {
          buffer: encryptedBuffer,
          firstKey: {
            role,
            accountIndex
          }
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(encryptedBuffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );

      await ui.ok();

      expect(await response).toRespondWith({
        buffer: expectedDecrypted
      });
    });

    it("should try to decrypt a malformed buffer", async () => {
      const { request } = await installSnap();

      const encryptedBuffer = "not-an-encrypted-buffer";
      const role = "memo";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_decrypt",
        params: {
          buffer: encryptedBuffer,
          firstKey: {
            role,
            accountIndex
          }
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(encryptedBuffer);

      await ui.ok();

      expect(await response).toRespondWithError({
        code: -32603,
        data: {
          cause: expect.stringContaining("Non-typed Error during Wasm call:")
        },
        message: "Failed to decrypt",
        stack: expect.any(String)
      });
    });

    it("should fail when trying to decrypt with an unsupported role", async () => {
      const { request } = await installSnap();

      const encryptedBuffer =
        "#111111114nr3f4fuhkhDsMaueiLLqSjLYCne6pBT67vLvkNN6kGskRXZv6cfpPqscHKK8KBPXUdpcyYbqj1D2HvB7fxdWc7Db32swnHeyQiXtv4kPbM3AmpLfBnVTuC";
      const role = "invalidrole";
      const accountIndex = 0;

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_decrypt",
        params: {
          buffer: encryptedBuffer,
          firstKey: {
            role,
            accountIndex
          }
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Invalid key index type: invalidrole",
        stack: expect.any(String)
      });
    });

    it("should fail with wrong key (unable to decrypt)", async () => {
      const { request } = await installSnap();

      // This was encrypted with a different key than what we're using to decrypt
      const encryptedBuffer =
        "#11111111DLETzZyirVfcLmtTjsjHEqrRUFF2Fr8QGygDz5SvcTh91G1e1tZGWF3pHtRcVVqtTbnM4KWYeYrEi1E2coKsLLvNb6oiF4664Q3HGRegqkvtqxHZWEg8bpA";
      const role = "posting";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_decrypt",
        params: {
          buffer: encryptedBuffer,
          firstKey: {
            role,
            accountIndex
          }
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(encryptedBuffer);

      await ui.ok();

      expect(await response).toRespondWithError({
        code: -32603,
        data: {
          cause: expect.stringContaining("Decryption failed")
        },
        message: "Failed to decrypt",
        stack: expect.any(String)
      });
    });

    it("should fail on missing required params - buffer", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_decrypt",
        params: {
          firstKey: {
            role: "memo"
          }
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Input buffer must be a string",
        stack: expect.any(String)
      });
    });

    it("should fail on missing required params - firstKey", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_decrypt",
        params: {
          buffer:
            "#111111114nr3f4fuhkhDsMaueiLLqSjLYCne6pBT67vLvkNN6kGskRXZv6cfpPqscHKK8KBPXUdpcyYbqj1D2HvB7fxdWc7Db32swnHeyQiXtv4kPbM3AmpLfBnVTuC"
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Key data must be an object",
        stack: expect.any(String)
      });
    });

    it("should fail on rejected user dialog", async () => {
      const { request } = await installSnap();

      const encryptedBuffer =
        "#111111114nr3f4fuhkhDsMaueiLLqSjLYCne6pBT67vLvkNN6kGskRXZv6cfpPqscHKK8KBPXUdpcyYbqj1D2HvB7fxdWc7Db32swnHeyQiXtv4kPbM3AmpLfBnVTuC";
      const role = "memo";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_decrypt",
        params: {
          buffer: encryptedBuffer,
          firstKey: {
            role,
            accountIndex
          }
        }
      });

      // Intentionally cancel the confirmation dialog
      await (
        (await response.getInterface()) as SnapConfirmationInterface
      ).cancel();

      expect(await response).toRespondWithError({
        code: 4001,
        message: "User denied the buffer decode",
        stack: expect.any(String)
      });
    });
  });
});
