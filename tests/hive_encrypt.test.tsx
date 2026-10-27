import {
  installSnap,
  type SnapConfirmationInterface
} from "@metamask/snaps-jest";
import { base58 } from "@scure/base";
import { execFile } from "child_process";
import { resolve } from "path";
import { promisify } from "util";

// Memo public key of account 0 for the test mnemonic (jest.config.js)
const SNAP_MEMO_PUBLIC_KEY =
  "STM7FUkohAwxVdGmkQrmksDZ6icTAMu5344gmVvnLh5CKQwQGEhQF";

/**
 * Converts a WIF public key into its compressed secp256k1 point.
 * @param publicKey - `STM`-prefixed public key.
 * @returns The 33 key bytes, without the checksum.
 */
const publicKeyBytes = (publicKey: string): Uint8Array =>
  base58.decode(publicKey.slice("STM".length)).subarray(0, 33);

/**
 * Decrypts a memo with the repository's wax, outside the snap.
 * @param wifPrivateKey - Private key of the memo's sender or recipient.
 * @param memo - `#`-prefixed memo.
 * @returns The decrypted content.
 */
const waxDecrypt = async (
  wifPrivateKey: string,
  memo: string
): Promise<string> => {
  const { stdout } = await promisify(execFile)(process.execPath, [
    resolve(__dirname, "support/waxDecrypt.mjs"),
    wifPrivateKey,
    memo
  ]);
  return stdout;
};

// A decodable 1x1 red RGB PNG: the image hoster rejects images it cannot decode.
const PNG_1X1_RED_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP4z8AAAAMBAQD3A0FDAAAAAElFTkSuQmCC";

/**
 * Uploads a signed image to the image hoster.
 * @param postUrl - Hoster URL including the account and the upload signature.
 * @param formData - Multipart body carrying the image as `file`.
 * @returns The URL the hoster assigned to the uploaded image.
 * @throws If the hoster is unreachable, rejects the signature, or rejects
 * the upload for any other reason.
 */
const uploadToImageHoster = async (
  postUrl: string,
  /* eslint-disable-next-line no-restricted-globals */
  formData: FormData
): Promise<string> => {
  const response = await fetch(postUrl, {
    method: "POST",
    body: formData
  }).catch((error: unknown) => {
    throw new Error(`Image hoster unreachable at ${postUrl}: ${String(error)}`);
  });

  const body = await response.text();
  let resJSON: { url?: unknown; error?: { name?: unknown } };
  try {
    resJSON = JSON.parse(body);
  } catch {
    throw new Error(
      `Image hoster returned a non-JSON response (HTTP ${response.status}): ${body}`
    );
  }

  if (resJSON.error?.name === "invalid_signature") {
    throw new Error(`Image hoster rejected the snap's signature: ${body}`);
  }

  if (!response.ok || typeof resJSON.url !== "string") {
    throw new Error(
      `Image hoster rejected the upload for a reason other than the signature (HTTP ${response.status}): ${body}`
    );
  }

  return resJSON.url;
};

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
          nonce: 1 // Makes test results deterministic
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
          "#FZ6E2HYaifQzeQcb65G3K655Y78FjGxarYE2hqRVQZdfzN5MzTSQeyFHrW6vdurgYZemzZqYXjoRyxwEJyPav3kv8uDC3BAZhhLV6iEEUExFJzCgqY7AJoBgsXuaaQzxj"
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
          nonce: 1
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
          "#FZ6E2HYaifQzeQcb65G3K655Y78FjGxarYE2hqRVQZdfzN5MzTSQeyFHrW6vdurgYZemzZqYXjoRyxwEJyPav3kv8uDC3BAZhhLV6iEEUExFJzCgqY7AJoBgsXuaaQzxj"
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
          nonce: 1
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
          "#FZ6E2HYaifQzeQcb65G3K655Y78FjGxarYE2hqRVQZdfzMYKByx48X2iJPkSzkBGEvFejrrmTFw4hsYL1Kn3szC3qeAakwEaxLFzTfUFhAUSrudbVrncCpahMhLQs91SY"
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
          nonce: 1
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
          "#FZ6E2HYaifQzeQcb65G3K655Y78FjGxarYE2hqRVQZdfzQ1MhPEvCBtxFzopiZQbf8Z7wn215vjcFCBrHjukt8Wjg2WTC8oHReiQLLqjaUNC2yymnwPF28QMWkAezeAfk"
      });
    });

    it("should encode a memo in the standard field order that wax decrypts with the recipient's key", async () => {
      const { request } = await installSnap();

      const buffer = "Hello world";
      // private key: 5KRSDQEeNsLdSBKqxLEB98BvEMkw9gAEHKj4Grvd92agWN6Hq1B
      const recipientPrivateKey =
        "5KRSDQEeNsLdSBKqxLEB98BvEMkw9gAEHKj4Grvd92agWN6Hq1B";
      const recipientPublicKey =
        "STM8LYDC8gWEtsdFvm4gzRmcsJnmuhCMcpL7vxpXPh6pGUZxE9WhY";

      const response = request({
        origin: "Jest",
        method: "hive_encrypt",
        params: {
          buffer,
          firstKey: {
            role: "memo"
          },
          secondKey: recipientPublicKey
        }
      });

      await ((await response.getInterface()) as SnapConfirmationInterface).ok();

      const encryptResponse = await response;
      const memo = (encryptResponse.response as { result: { buffer: string } })
        .result.buffer;
      expect(memo.startsWith("#")).toBe(true);

      // from | to | nonce | check | encrypted
      const bytes = base58.decode(memo.slice(1));
      const from = bytes.subarray(0, 33);
      const to = bytes.subarray(33, 66);
      expect([0x02, 0x03]).toContain(from[0]);
      expect([0x02, 0x03]).toContain(to[0]);
      expect(from).toStrictEqual(publicKeyBytes(SNAP_MEMO_PUBLIC_KEY));
      expect(to).toStrictEqual(publicKeyBytes(recipientPublicKey));

      expect(await waxDecrypt(recipientPrivateKey, memo)).toBe(buffer);
    });

    it.each([494, 1000, 2048])(
      "should encode %i-byte content that hive_decrypt and wax decrypt round-trip",
      async (size) => {
        const { request } = await installSnap();

        const buffer = Array.from({ length: size }, (_, index) =>
          String.fromCharCode(0x21 + (index % 94))
        ).join("");
        // private key: 5KRSDQEeNsLdSBKqxLEB98BvEMkw9gAEHKj4Grvd92agWN6Hq1B
        const recipientPrivateKey =
          "5KRSDQEeNsLdSBKqxLEB98BvEMkw9gAEHKj4Grvd92agWN6Hq1B";
        const recipientPublicKey =
          "STM8LYDC8gWEtsdFvm4gzRmcsJnmuhCMcpL7vxpXPh6pGUZxE9WhY";

        const encryptResponse = request({
          origin: "Jest",
          method: "hive_encrypt",
          params: {
            buffer,
            firstKey: {
              role: "memo"
            },
            secondKey: recipientPublicKey
          }
        });
        await (
          (await encryptResponse.getInterface()) as SnapConfirmationInterface
        ).ok();
        const memo = (
          (await encryptResponse).response as { result: { buffer: string } }
        ).result.buffer;
        expect(memo.startsWith("#")).toBe(true);

        const decryptResponse = request({
          origin: "Jest",
          method: "hive_decrypt",
          params: {
            buffer: memo,
            firstKey: {
              role: "memo"
            }
          }
        });
        await (
          (await decryptResponse.getInterface()) as SnapConfirmationInterface
        ).ok();
        expect(await decryptResponse).toRespondWith({ buffer });

        expect(await waxDecrypt(recipientPrivateKey, memo)).toBe(buffer);
      }
    );

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
          nonce: 1
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
          "#CehkFy2vFmLo9su3JGukRfDNFZURck4A2JVH6GuEzKMeeZCkZNh7SDjYRgWap5UsLm26P6MgrDQ4sgyfMpwbpzqG3TYYUJvKEW1jfw6FBHbwsLukQ1knztPutqk2MKRru"
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
          nonce: 1
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
          "#DSrGaeRFFKdevEfiPofsYYAV4QCL3ux2r1yGap8vPSGNTU2sYM97K8sJgXXnxKKSx2sEwN2eieKjH9bWPhfcXSVoVJVoiwrsfZyKgMsTEvEEwdG73RsUCe9KWVTAdcEqZ"
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
          nonce: 1
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
          "#FZ6E2HYaifQzeQcb65G3K655Y78FjGxarYE2hqRVQZdfzN5MzTSQeyFHrW6vdurgYZemzZqYXjoRyxwEJyPav3kv8uDC3BAZhhLV6iEEUEwxzRBF5xnYsCLNXPrDVb9a2"
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
          nonce: 1
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
          "#Niqfh4vftYfuUnBRrEjDzWkVrXAd896kWcfb3vT5hmnNmehuMoQvr9WueYPU4ZyGtrGG75pmAU3juvUsAuSvhfvybUPryi8MeekXTTsLbxuPimsPQbY4hvD882gmvyE71zgC7sBtspRgG96UdbjWT9JQU1gjMvK2JFtyXkSfC8xQDYAPQuXqiMQPhe1XmdEEXm89AaHMCQuxt4pV4KJWrq4LbzFLtLtoJryhFJ38H1XPTVKQyqGMe5UdpminXKeJrUGT7sGmD5n76m7ZDS5tecDCWJ3UwX5otnNwx1BWQCDTDz9TH5f9dKL1jH5vTQYRdg15SyKbAJ6drwy5EfkBjE9Q8oE5ANfFTxetAHRQ2p45r3bKSHdPiZo2KZ6CjFcP7GWQqPRgQ5j1W34h88BGH9xrYGwXqn9iYv1BfxFUBYdBfnf2apW13HYRP2gh27iooRuxSdbr5UGW9dbueBcD5th43rTuSZc9TYUFpneWDxqPAYei6qDmU66UPVEpZVCt2tE5PHg8UbHTBNxPQqBrJxLcfK3M2Tczs3VNLat4FJ1X6RDymHJTmPWa7g8BSdddi3Wf2r7u2FF8gDSHqanVqwfBy5UC4EYjNAtvpgjmuhMsiesvngAfzE949sxYvBBS4y6c1N7Qz8wmDBa6w5UKdbfxmBu3j1GKsXiKyL4aH7psrbn4UXjmLeM71hp6osrGRCFUZpcF7MNVeVdmYKs2g1RBeeAJfMJVTziatUnEXhdBATpfyuHmSNXm9ZgeXUnpSgLgGiYE4DycsGdspepy9dsV2fsfMHp2KpQ17CAhW2hTDtECk4HaefridZiT3HoRXm2Mwv2VHfZcmgjmLyyZJudKFKqzGR9s1ueR6i6LkWh1kbsXfNSeVzGZXwVYf99xWM6ktbYNi4NNgRb3cpKAipCrHj2Tso9RcMFPbW6tJHhsBrSFNHBEZ2PVHcsXET1tEUAeQY3Rn7RgzbU2HiJkXqmBDNW8UNxAnqvGQSuqDCh8c784SseQvGEJMNdPGAzbCxuch9rwHdyxKhKU7vQ94MY9MmCsf49pAJwjEYUFudDhe2MHDtXj2hMAwJVzFh25huEsihgvDc4KoKwwUmxKEEuzBzna7u2Qjx8wsWnRGXNT5brzccb4QjTWkvq4h7sx6AjjBsgUgJvN1j5i5BsAqcyVjJUyoV1hqHtEkHeJKH3oKmqPe5pawmjvgFb7Agpi4WEHQzQS9E4YKR9KKcHqyAjVJEweZhH9FcTVi4H7yLwk626M653AHEXXRYNL3ftA2ntoyYP28a1ENDEaXWbyR4zY98fxfYcpkVdh2AUW6iJAVmXq2rmnarYcERxxW5ZsCoQkDRzPboDpEfcKjCw5gXvkYSfPsK2hFekYxVieiXEN9kxCPT3CTVX1khGCWSmB9Hs3QUR5yFBv9ARToxihZuXX4jNmCKB8tUpChmTS6S2fNTKXPQNnP48B76SJnRf5mSw9mZVTLhyRM"
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
          nonce: 1
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
          nonce: 1
        }
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui.type).toBe("confirmation");
      // We do not need to check the content here, as we are expecting an error
      await ui.ok();

      expect(await response).toRespondWithError({
        code: -32603,
        data: {
          cause: expect.stringContaining("public key requires prefix: STM")
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

      const imageData = new Uint8Array(
        Buffer.from(PNG_1X1_RED_BASE64, "base64")
      );
      /* eslint-disable-next-line no-restricted-globals */
      const pngBlob = new Blob([imageData], { type: "image/png" });

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
          "2001e80f7490fc1de6209312aedb0d8cbbb7e48db99fb51ee143aa8b1dd236a78d48b52697584cc816f2423a9c05296c99f2d946a05e9bd4f44888d8cba5aa7e36"
      });

      const signature = (
        signatureResponse.response as { result: { buffer: string } }
      ).result.buffer;

      /* eslint-disable-next-line no-restricted-globals */
      const formData = new FormData();
      formData.append("file", pngBlob, "image.png");

      const postingKeyAddedUser =
        /* eslint-disable-next-line n/no-process-env, jest/no-conditional-in-test */
        process.env.POSTING_KEY_ADDED_USER ?? "guest4test";

      const imageHosterUrl =
        /* eslint-disable-next-line n/no-process-env, jest/no-conditional-in-test */
        process.env.IMAGE_HOSTER_URL ?? "https://images.hive.blog";

      const postUrl = `${imageHosterUrl}/${postingKeyAddedUser}/${signature}`;

      const uploadedUrl = await uploadToImageHoster(postUrl, formData);

      const matchRegex = new RegExp(
        `^${imageHosterUrl}/[a-zA-Z0-9]+/image\\.png$`,
        "u"
      );

      // https://images.hive.blog/DQmVsw5pPTUjXLFBv9yrA5TSSwv4VmXPPzGc87sRNiZbRsm/image.png
      expect(uploadedUrl).toMatch(matchRegex);
    });
  });
});
