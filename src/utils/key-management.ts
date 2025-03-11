import type { TRole } from "@hiveio/wax";
import type { KeyIndex } from "../rpc";

const KeyIndexToPathMap = {
  owner: 0,
  active: 1,
  memo: 3,
  posting: 4
} as const satisfies Record<TRole, number>;

export const keyIndexToPath = (keyIndex: KeyIndex): string[] => {
  const keyIndexType = KeyIndexToPathMap[keyIndex.role];
  if (keyIndexType === undefined)
    throw new Error(`Invalid key index type: ${keyIndex.role}`);

  return ["m", "48'", "13'", `${keyIndexType}'`, `${keyIndex.accountIndex ?? 0}'`, "0'"];
};
