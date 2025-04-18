import type { THexString, TPublicKey, TRole } from "@hiveio/wax";

export type KeyIndex = {
  accountIndex?: number;
  role: TRole;
};

export type PublicKeyData = Required<KeyIndex> & {
  publicKey: TPublicKey;
};

export type GetPublicKeyRequest = {
  method: "hive_getPublicKeys";
  params: {
    keys: KeyIndex[];
  };
};

export type SignTransactionRequest = {
  method: "hive_signTransaction";
  params: {
    transaction: string;
    chainId?: string;
    keys: KeyIndex[];
  };
};

export type SignBufferRequest = {
  method: "hive_encrypt";
  params: {
    buffer: string;
    firstKey: KeyIndex;
    secondKey?: KeyIndex | string;
  };
};

export type DecodeBufferRequest = {
  method: "hive_decrypt";
  params: {
    buffer: string;
    firstKey: KeyIndex;
  };
};

export type BufferResponse = {
  buffer: string;
};

export type GetPublicKeyResponse = {
  publicKeys: PublicKeyData[];
};

export type SignTransactionResponse = {
  signatures: THexString[];
};

export type RpcRequest =
  | GetPublicKeyRequest
  | SignTransactionRequest
  | SignBufferRequest
  | DecodeBufferRequest;
export type RpcResponse =
  | GetPublicKeyResponse
  | SignTransactionResponse
  | BufferResponse;
