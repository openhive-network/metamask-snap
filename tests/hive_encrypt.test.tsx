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
      // private key: 5KRSDQEeNsLdSBKqxLEB98BvEMkw9gAEHKj4Grvd92agWN6Hq1B
      const secondKey = "STM8LYDC8gWEtsdFvm4gzRmcsJnmuhCMcpL7vxpXPh6pGUZxE9WhY";

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
          "#111111114qbL26LTwSqQg3VtKqyb2gdS3dmmzUGGfKj97AfZNRspcFEEBFMG8ktypL9c8rj2rAZASs6LLo4e1cD1boDqeDsCZDPcC3kUk4tQvgZTLgtKGVhwyRamuPK"
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

    it("should successfully encode buffer with a non-default role (posting)", async () => {
      const { request } = await installSnap();

      const buffer = "Hello world";

      const role = "posting";
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
          "#11111111N5UZWjwf2UzcJsMQMWhdtEFgYNX3qWVNhc7jyMxv1yDNEQDMDQSCJ3EczvTieskoKVsf4GPVjupcvhRhXaeC3eUmsgRF6CAxvzPpQ6AyqHqZX2HfZr3GDDY"
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

    it("should successfully sign a byte array buffer for myself", async () => {
      const { request } = await installSnap();

      const buffer = [72, 101, 108, 108, 111]; // "Hello" in bytes

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
          }
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      const props = ui.content.props as any;
      expect(props.children[0].props.children[0].props.children).toBe(origin);
      // For byte arrays, the dialog wraps content in a Box with byte length text
      const byteBox = props.children[1];
      expect(byteBox.props.children[0].props.children[1]).toBe(
        String(buffer.length)
      );
      expect(byteBox.props.children[1].props.value).toBe("48656c6c6f");

      await ui.ok();

      expect(await response).toRespondWith({
        buffer:
          "1f6fefa12b8a4857a4c82806461e7a0e5e3174feda4172cbbe6ea5f64ec10f238b3b81956315ca3dabd7e1bce8e6c91ae7a5e8093aeef5651f5c05f98e5932fd1e"
      });
    });

    it("should successfully sign a byte array buffer for other key index", async () => {
      const { request } = await installSnap();

      const buffer = [1, 2, 3, 4, 5];

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
          }
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.ok();

      expect(await response).toRespondWith({
        buffer:
          "1fc33a41bf1560b608c821815e186c0eeeb6f25112025696768bc9fd5478f34baa3ef1494aaf56a08e6cfcb727a67f92c98ce8a4b58340b515bf8d892ec852ae4a"
      });
    });

    it("should fail when buffer is invalid type (not string or array)", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer: 12345,
          firstKey: {
            role: "memo"
          }
        }
      });

      expect(response).toRespondWithError({
        code: -32000,
        message: "Input buffer must be a string or number array - bytes",
        stack: expect.any(String)
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
        message: "Input buffer must be a string or number array - bytes",
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

    it("should sign image for image hoster", async () => {
      const { request } = await installSnap();

      const imageStr = "<svg xmlns='http://www.w3.org/2000/svg'/>";
      const imageData = new TextEncoder().encode(imageStr);
      /* eslint-disable-next-line no-restricted-globals */
      const svgBlob = new Blob([imageData], { type: "image/svg+xml" });

      // Image hoster logic:

      // Create the prefix as a Uint8Array
      const encoder = new TextEncoder();
      const prefix = encoder.encode("ImageSigningChallenge");

      // Concatenate without Buffer.concat
      // We create a new array of the total length and "set" the parts into it
      const signingBuffer = new Uint8Array(prefix.length + imageData.length);
      signingBuffer.set(prefix);
      signingBuffer.set(imageData, prefix.length);
      const buffer = Array.from(signingBuffer);

      const role = "posting";
      const accountIndex = 0;

      const origin = "Jest";
      const response = request({
        origin,
        method: "hive_encrypt",
        params: {
          buffer,
          firstKey: {
            role,
            accountIndex // Using: "STM815feFpPR2eBsmhkzTwQDmomKYNWQMSUg9kndoQxT5U6FyqfDT" (posting key)
          }
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      await ui.ok();

      const signatureResponse = await response;

      expect(signatureResponse).toRespondWith({
        buffer:
          "1f97060801ad1b5de2182a1604a28a63d2ea8ea95f5eb82e799ba7b5ed31defd6b48411cfca50745b71e198a4f660f2ee8f8ee137c1699d56dbe71059535439ed6"
      });

      const signature = (
        signatureResponse.response as { result: { buffer: string } }
      ).result.buffer;

      /* eslint-disable-next-line no-restricted-globals, n/no-unsupported-features/node-builtins */
      const formData = new FormData();
      formData.append("file", svgBlob, "image.svg");

      const postingKeyAddedUser =
        /* eslint-disable-next-line n/no-process-env, jest/no-conditional-in-test */
        process.env.POSTING_KEY_ADDED_USER ?? "guest4test";

      const imageHosterUrl =
        /* eslint-disable-next-line n/no-process-env, jest/no-conditional-in-test */
        process.env.IMAGE_HOSTER_URL ?? "https://images.hive.blog";

      const postUrl = `${imageHosterUrl}/${postingKeyAddedUser}/${signature}`;

      /* eslint-disable-next-line n/no-unsupported-features/node-builtins */
      const imageUploadResponse = await fetch(postUrl, {
        method: "POST",
        body: formData
      });
      const resJSON = await imageUploadResponse.json();

      console.log("Image hoster reponded with:", resJSON);

      const matchRegex = new RegExp(
        `^${imageHosterUrl}/[a-zA-Z0-9]+/image\\.svg$`,
        "u"
      );

      // https://images.hive.blog/DQmVsw5pPTUjXLFBv9yrA5TSSwv4VmXPPzGc87sRNiZbRsm/image.svg
      expect(resJSON.url).toMatch(matchRegex);
    });
  });
});
