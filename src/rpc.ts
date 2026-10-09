import type { THexString, TPublicKey, TRole } from "@hiveio/wax";
import type { Json } from "@metamask/snaps-sdk";

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

export type AiProviderId = "anthropic" | "openai" | "deepseek";

export type AiStoreKeyRequest = {
  method: "hive_aiStoreKey";
  params: {
    provider: AiProviderId;
    apiKey: string;
    label?: string;
  };
};

export type AiListKeysRequest = {
  method: "hive_aiListKeys";
  params: Record<string, never>;
};

export type AiForgetKeyRequest = {
  method: "hive_aiForgetKey";
  params: {
    provider: AiProviderId;
  };
};

export type AiCallRequest = {
  method: "hive_aiCall";
  params: {
    provider: AiProviderId;
    path: string;
    body: Record<string, Json>;
  };
};

export type AiKeyInfo = {
  provider: AiProviderId;
  label?: string;
};

export type AiStoreKeyResponse = {
  stored: AiKeyInfo;
};

export type AiListKeysResponse = {
  keys: AiKeyInfo[];
};

export type AiForgetKeyResponse = {
  forgotten: boolean;
};

export type AiCallResponse = {
  status: number;
  body: Json;
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
  | DecodeBufferRequest
  | AiStoreKeyRequest
  | AiListKeysRequest
  | AiForgetKeyRequest
  | AiCallRequest;
export type RpcResponse =
  | GetPublicKeyResponse
  | SignTransactionResponse
  | BufferResponse
  | AiStoreKeyResponse
  | AiListKeysResponse
  | AiForgetKeyResponse
  | AiCallResponse;
