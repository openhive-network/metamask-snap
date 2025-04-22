import type { RpcRequest, RpcResponse } from "./rpc";
import { decodeBuffer } from "./snap/decodeBuffer";
import { encodeBuffer } from "./snap/encodeBuffer";
import { getPublicKeys } from "./snap/getPublicKeys";
import { signTransaction } from "./snap/signTransaction";

export type * from "./rpc";

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest = async ({
  origin,
  request
}: {
  origin: string;
  request: RpcRequest;
}): Promise<RpcResponse> => {
  switch (request.method) {
    case "hive_getPublicKeys":
      return {
        publicKeys: await getPublicKeys(request.params.keys)
      };

    case "hive_signTransaction":
      return {
        signatures: await signTransaction(
          origin,
          request.params.transaction,
          request.params.keys,
          request.params.chainId
        )
      };

    case "hive_decrypt":
      return {
        buffer: await decodeBuffer(
          origin,
          request.params.buffer,
          request.params.firstKey
        )
      };

    case "hive_encrypt":
      return {
        buffer: await encodeBuffer(
          origin,
          request.params.buffer,
          request.params.firstKey,
          request.params.secondKey,
          request.params.nonce
        )
      };

    default:
      throw new Error("Method not found.");
  }
};
