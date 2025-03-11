import type { THexString, TPublicKey, TRole } from "@hiveio/wax";

export type KeyIndex = {
  accountIndex?: number;
  role: TRole;
}

export type PublicKeyData = Required<KeyIndex> & {
  publicKey: TPublicKey;
}

export type GetPublicKeyRequest = {
  method: 'hive_getPublicKeys';
  params: {
    keys: KeyIndex[];
  };
};

export type SignTransactionRequest = {
  method: 'hive_signTransaction';
  params: {
    transaction: string;
    keys: KeyIndex[];
  };
}

export type GetPublicKeyResponse = {
  publicKeys: PublicKeyData[];
}

export type SignTransactionResponse = {
  signatures: THexString[];
}

export type RpcRequest = GetPublicKeyRequest | SignTransactionRequest;
export type RpcResponse = GetPublicKeyResponse | SignTransactionResponse;
