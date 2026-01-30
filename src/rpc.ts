import type { THexString, TPublicKey, TRole } from "@hiveio/wax";

export type KeyIndex = {
  accountIndex?: number;
  role?: TRole;
  addressIndex?: number;
};

export type PublicKeyData = {
  accountIndex: number;
  addressIndex: number;
  publicKey: TPublicKey;
  role?: TRole;
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

export type EncryptBufferRequest = {
  method: "hive_encrypt";
  params: {
    buffer: string | number[];
    firstKey: KeyIndex;
    secondKey?: KeyIndex | string;
    nonce?: number;
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
  | EncryptBufferRequest
  | DecodeBufferRequest;
export type RpcResponse =
  | GetPublicKeyResponse
  | SignTransactionResponse
  | BufferResponse;
