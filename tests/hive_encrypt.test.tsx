import {
  installSnap,
  type SnapConfirmationInterface
} from "@metamask/snaps-jest";

describe("onRpcRequest", () => {
  describe("hive_encrypt", () => {
    it("should successfully encode simple buffer for myself - implicit account index 0", async () => {
      const { request } = await installSnap();

      const buffer = "Hello world";

      const role = "memo";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer,
          firstKey: {
            role
          },
          nonce: 0 // Makes test results deterministic
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      // expect(ui.content).toRender(...); fails due to some stupid jsx rendering issue
      // So we will check the content manually for most important parts, such as:
      // origin, buffer, role, account index, and secondKey
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(buffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );
      expect(props.children[7].props.children[1].props.children).toBe(
        "yourself"
      );

      await ui.ok();

      expect(await response).toRespondWith({
        buffer:
          "#111111114nr3f4fuhkhDsMaueiLLqSjLYCne6pBT67vLvkNN6kGskRXZv6cfpPqscHKK8KBPXUdpcyYbqj1D2HvB7fxdWc7Db32swnHeyQiXtv4kPbM3AmpLfBnVTuC"
      });
    });

    it("should successfully encode simple buffer for same key index - implicit account index 0", async () => {
      const { request } = await installSnap();

      const buffer = "Hello world";

      const role = "memo";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer,
          firstKey: {
            role
          },
          secondKey: {
            role
          },
          nonce: 0
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(buffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );
      expect(props.children[6][0].props.children[1].props.children).toBe(role);
      expect(props.children[6][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );

      await ui.ok();

      expect(await response).toRespondWith({
        buffer:
          "#111111114nr3f4fuhkhDsMaueiLLqSjLYCne6pBT67vLvkNN6kGskRXZv6cfpPqscHKK8KBPXUdpcyYbqj1D2HvB7fxdWc7Db32swnHeyQiXtv4kPbM3AmpLfBnVTuC"
      });
    });

    it("should successfully encode simple buffer for other key index", async () => {
      const { request } = await installSnap();

      const buffer = "Hello world";

      const role = "memo";
      const accountIndex1 = 0;
      const accountIndex2 = 1;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer,
          firstKey: {
            role,
            accountIndex: accountIndex1
          },
          secondKey: {
            role,
            accountIndex: accountIndex2
          },
          nonce: 0
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(buffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex1)
      );
      expect(props.children[6][0].props.children[1].props.children).toBe(role);
      expect(props.children[6][0].props.children[4].props.children[1]).toBe(
        String(accountIndex2)
      );

      await ui.ok();

      expect(await response).toRespondWith({
        buffer:
          "#11111111GYeDYrsrBrR7NzNFVbRSqxo3SqER8KRBRvueAbKJiEdc9JHFwFGXME8rW5Q7yLmzyFqhR75Qm4sneYgoGV4AahmWvvTtU3RScUBadbKNZyxV1hs72GNk1e2"
      });
    });

    it("should successfully encode simple buffer for other Hive user - direct STM public key provided", async () => {
      const { request } = await installSnap();

      const buffer = "Hello world";

      const role = "memo";
      const accountIndex = 0;
      const secondKey = "STM65wH1LZ7BfSHcK69SShnqCAH5xdoSZpGkUjmzHJ5GCuxEK9V5G";

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer,
          firstKey: {
            role,
            accountIndex
          },
          secondKey,
          nonce: 0
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(buffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );
      expect(props.children[5].props.value).toBe(secondKey);

      await ui.ok();

      expect(await response).toRespondWith({
        buffer:
          "#11111111DLETzZyirVfcLmtTjsjHEqrRUFF2Fr8QGygDz5SvcTh91G1e1tZGWF3pHtRcVVqtTbnM4KWYeYrEi1E2coKsLLvNb6oiF4664Q3HGRegqkvtqxHZWEg8bpA"
      });
    });

    it("should successfully encode buffer with a non-default role (active)", async () => {
      const { request } = await installSnap();

      const buffer = "Hello world";

      const role = "active";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer,
          firstKey: {
            role,
            accountIndex
          },
          nonce: 0
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(buffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );
      expect(props.children[7].props.children[1].props.children).toBe(
        "yourself"
      );

      await ui.ok();

      expect(await response).toRespondWith({
        buffer:
          "#111111117yqGc5E9CHFw1Q7NPiUJfgUZw1RLs4DhqjZhf5G7es6CQPreDvoTfQCjmyVx9HpkFsZSofjZsxLTULuhPqUZMq1kXCfBRfDabrLrzmqwWH6YM7sSC42uDuA"
      });
    });

    it("should successfully encode an empty buffer", async () => {
      const { request } = await installSnap();

      const buffer = "";

      const role = "memo";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer,
          firstKey: {
            role,
            accountIndex
          },
          nonce: 0
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(buffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );
      expect(props.children[7].props.children[1].props.children).toBe(
        "yourself"
      );
      await ui.ok();

      expect(await response).toRespondWith({
        buffer:
          "#111111114nr3f4fHNY7j1nKU73F9uJdAfGB4gNDKe7VUEZtdpAMhVFGu1edfHveG4sYeHqkeP1gJpDZ4g57DyktxXd1SgDfenrm4vSizBVjZKyge15FGxUC4E5huH4W"
      });
    });

    it("should successfully encode a large buffer", async () => {
      const { request } = await installSnap();

      // Create a 1000 character string
      const buffer = "A".repeat(1000);

      const role = "memo";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer,
          firstKey: {
            role,
            accountIndex
          },
          nonce: 0
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      expect(props.children[1].props.value).toBe(buffer);
      expect(props.children[3][0].props.children[1].props.children).toBe(role);
      expect(props.children[3][0].props.children[4].props.children[1]).toBe(
        String(accountIndex)
      );
      expect(props.children[7].props.children[1].props.children).toBe(
        "yourself"
      );
      await ui.ok();

      expect(await response).toRespondWith({
        buffer:
          "#111111116f8Tdwa2mKy1zi6q9egTkiMGvW4gTgTwgLH1b47nmKkDcxXLcM4Tu7aFkEq3dME18ULJg862bcnAydHxYbeft8Nff41sgHXvrVn681VF1p3BCpY7FsrvcV9hxeFn3akhRD1qeWpYSQDrnA8gvZtTmDB7TqdwB5zgmp8g6AMeyKNmxiRi5AqrM2MmjEQfScRYT8ojJyXiVyKVsxtifEY8ynven7BgnMBse1vrdeKLw1wRMj1rarCNLzHEPqW8Rzhfac9Yae2hbu4t9LpDrhN8vM2mu4ysKBogV5aXnEKtjbXYXxku5VN3n1p6T4cRePGzsxnoctmjbCeMDoY7vCwbZACXKaYivH8Lpyzm4sho2fwPGMZPCWoBskjFrxdyFb4kVemhat8AX1TUvy6y2DaE8rrGCWef1uR9PUBRos5x4eGu7AdKiXwwcZQej7caad1JpYWruwZJEuyyhs7k8oydkV9aDCjMos9giX7XhEJXe31zFJ87QVoEdrXHY4BHNuUdaQpTYtsfjmrHW5gD4ATj79GYJTcnjMWdf8LMFVvscYMqpWMSd5ru7xGk1Cbco7nPKJV8k4GynBCXe4uWu8d4E6tkfWBpqmwvdbknU6WbTEaBrtet6SizYvGzVSfUMwzn23FULFTEjshTCEiXXhu7h2a9cFfCLDWWhZQ4DHqYM55TzyrvqPg8vAH7ToAA49M2HbZ5kEbwiiiZoWpYabSLQaA77qyEV2EMPEGdDeH8r9GCKTAndw8zmArJkjEewbD8prA74NwVzUHgCgcnvFnAZtZYTi7mpmNNDYmFB9LMyXEM97Uw748ZwNraGE3cBANAnrtNgif9iwmUVG6sZRSGd71D3LUewDxm3tAAz6xpqBJ1vL6yMTP2pL8TnZuTQq4Hffy7h7cTDuXgWuHL2iqaSzDgspMRqbqWmPXvxR4tN1YURu5P6UjQ7QvbafSkceKqCgLvbnyntWCXZ8Ma6NkP3Zjo3AZ1hHH7VLLAy1otiwwaQGLxTm3pkkEK5t5MKbzATtri1wH5Eecp5yWBMbLpxN7TKmLWH315mdBoxfiforAkMV6S3qtMQc1E2c8mQmiyQSCjFYmr6Ztpi5oWwh3BGTAC23EQ2ZkfqYmxMCQqAXAAqXgRbVAD7bXwsN8SH8rMwPjba6nMtSW1adsGXqKRy4WMmtsCpVVCxid3KzQ2quyrpeeou6Sq38NoSk6NsrrkatY5qjioZoRm5q1TDWfrMDmp29kMdEVzYsCqJh8grsJGsbhb6c71gU1fiB2sJJ8Lw25T3PRc7zvDnz8jmhTQUudYsF3p5JuRQZSFhRBn9YRcb6B5ZPC9GYxBKNXEDgWVhf6G1a2e6PhV2Qmm9amT7bRnAJ6ocJpoAunqYcdRFcNv7TmxekobaJMQKYX2yqU5GgzLyuQ1zt6NmYxFEHMwEtX5pQBDYXGTnKbgzYeemfBxwsw1RcAeWpGKrUssofRjaTL"
      });
    });

    it("should fail when firstKey has an unsupported role", async () => {
      const { request } = await installSnap();

      const buffer = "Hello world";
      const role = "invalidrole";
      const accountIndex = 0;

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer,
          firstKey: {
            role,
            accountIndex
          },
          nonce: 0
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Invalid key index type: invalidrole",
        stack: expect.any(String)
      });
    });

    it("should fail on invalid second key provided", async () => {
      const { request } = await installSnap();

      const buffer = "Hello world";

      const role = "memo";
      const accountIndex = 0;
      const secondKey = "randominvaliddata";

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer,
          firstKey: {
            role,
            accountIndex
          },
          secondKey,
          nonce: 0
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      // We do not need to check the content here, as we are expecting an error
      await ui.ok();

      expect(await response).toRespondWithError({
        code: -32603,
        data: {
          cause: expect.stringContaining(
            "public key requires STM prefix, but was given `randominvaliddata`"
          )
        },
        message: "Failed to encrypt",
        stack: expect.any(String)
      });
    });

    it("should fail on missed required params - buffer", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_encrypt",
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

    it("should fail on missed required params - firstKey", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer: "Hello world"
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

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_encrypt",
        params: {
          firstKey: {
            role: "memo"
          },
          buffer: "Key data must be an object"
        }
      });

      // Intentionally cancel the confirmation dialog
      await (
        (await response.getInterface()) as SnapConfirmationInterface
      ).cancel();

      expect(await response).toRespondWithError({
        code: 4001,
        message: "User denied the buffer encode",
        stack: expect.any(String)
      });
    });
  });
});
